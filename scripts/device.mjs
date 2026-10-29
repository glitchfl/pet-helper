// drives the debug build on the booted ios simulator or android emulator so an agent can look at the app
// usage: node scripts/device.mjs <ios|android> <command> [args] - see docs/agents/running-the-app.md
//   launch | restart          start the app, or kill it first for a full reload
//   open <route>              deep link, e.g. session?domain=verbal
//   shot <file.png>           screenshot shrunk to SHOT_HEIGHT pixels tall
//   appearance <dark|light>
//   tree                      android only - visible texts and labels with their centers
//   tap <text|label> | tap <x> <y>   android only
//   scroll <down|up> | back   android only
// every coordinate is in shot pixels, so a point read off a screenshot can be tapped as is
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

const APP = 'com.glitchfl.pethelper';
const SHOT_HEIGHT = 1000;
const ADB = `${process.env.ANDROID_HOME ?? `${homedir()}/Library/Android/sdk`}/platform-tools/adb`;

const run = (file, args) => execFileSync(file, args, { encoding: 'utf8', stdio: 'pipe' });
const simctl = (...args) => run('xcrun', ['simctl', ...args]);
const adb = (...args) => run(ADB, args);

function shrink(file) {
  run('sips', ['--resampleHeight', String(SHOT_HEIGHT), file, '--out', file]);
  console.log(file);
}

const ios = {
  launch: () => simctl('launch', 'booted', APP),
  restart: () => {
    simctl('terminate', 'booted', APP);
    simctl('launch', 'booted', APP);
  },
  // the pet-helper:// scheme stops on an "open in pet helper?" prompt - the bundle id scheme skips it
  open: (route) => simctl('openurl', 'booted', `${APP}://${route}`),
  shot: (file) => {
    simctl('io', 'booted', 'screenshot', file);
    shrink(file);
  },
  appearance: (mode) => simctl('ui', 'booted', 'appearance', mode),
};

const android = {
  launch: () => {
    adb('reverse', 'tcp:8081', 'tcp:8081');
    adb('shell', 'am', 'start', '-n', `${APP}/.MainActivity`);
  },
  restart: () => {
    adb('shell', 'am', 'force-stop', APP);
    android.launch();
  },
  // adb shell joins its arguments into one remote command line, so the url needs its own quotes
  open: (route) => adb('shell', `am start -a android.intent.action.VIEW -d 'pet-helper://${route}' ${APP}`),
  shot: (file) => {
    writeFileSync(file, execFileSync(ADB, ['exec-out', 'screencap', '-p']));
    shrink(file);
  },
  appearance: (mode) => adb('shell', 'cmd', 'uimode', 'night', mode === 'dark' ? 'yes' : 'no'),
  tree: () => {
    for (const node of visibleNodes()) console.log(`${node.x},${node.y}  ${node.label}${node.clickable ? '  [button]' : ''}`);
  },
  tap: (...target) => {
    const [x, y] = target.length === 2 ? target.map(Number) : nodeCenter(target.join(' '));
    const scale = screenScale();
    adb('shell', 'input', 'tap', String(Math.round(x * scale)), String(Math.round(y * scale)));
  },
  scroll: (direction) => {
    const [width, height] = screenSize();
    const [from, to] = direction === 'up' ? [0.3, 0.7] : [0.7, 0.3];
    adb('shell', 'input', 'swipe', ...[width / 2, height * from, width / 2, height * to, 300].map((n) => String(Math.round(n))));
  },
  back: () => adb('shell', 'input', 'keyevent', 'KEYCODE_BACK'),
};

function screenSize() {
  const sizes = [...adb('shell', 'wm', 'size').matchAll(/(\d+)x(\d+)/g)];
  return sizes.at(-1).slice(1).map(Number);
}

const screenScale = () => screenSize()[1] / SHOT_HEIGHT;

// uiautomator fails while an animation runs or the app is still loading - and it exits 0 when it does,
// so success is read off its output, or the last dump on the device would be returned stale
function dumpUi() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const output = adb('shell', 'uiautomator', 'dump', '/sdcard/ui.xml');
    if (output.includes('dumped to')) return adb('exec-out', 'cat', '/sdcard/ui.xml');
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
  }
  throw new Error('uiautomator could not read the screen - is the app still loading?');
}

function visibleNodes() {
  const scale = screenScale();
  const attribute = (node, name) => node.match(new RegExp(` ${name}="([^"]*)"`))?.[1] ?? '';
  const nodes = [];
  for (const [node] of dumpUi().matchAll(/<node [^>]*>/g)) {
    const label = [attribute(node, 'text'), attribute(node, 'content-desc')].filter(Boolean).join(' | ');
    const clickable = attribute(node, 'clickable') === 'true';
    if (!label && !clickable) continue;
    const [x1, y1, x2, y2] = attribute(node, 'bounds').match(/\d+/g).map(Number);
    nodes.push({ label, clickable, x: Math.round((x1 + x2) / 2 / scale), y: Math.round((y1 + y2) / 2 / scale) });
  }
  return nodes;
}

function nodeCenter(target) {
  const nodes = visibleNodes();
  const matches = nodes.filter((node) => node.label.split(' | ').includes(target));
  const [node] = matches.length ? matches : nodes.filter((node) => node.label.includes(target));
  if (!node) throw new Error(`nothing on screen reads "${target}" - run tree`);
  return [node.x, node.y];
}

const [platform, command, ...args] = process.argv.slice(2);
const commands = { ios, android }[platform];
if (!commands?.[command]) {
  const iosOnly = platform === 'ios' && command in android ? ' - ios has no tap driver here, use android' : '';
  console.error(`unknown command "${platform} ${command ?? ''}"${iosOnly}`);
  process.exit(1);
}
if (command === 'shot') args[0] = resolve(args[0]);
commands[command](...args);
