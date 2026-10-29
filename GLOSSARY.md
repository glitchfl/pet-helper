# PET Helper

A free, public practice app for the Israeli Psychometric Entrance Test (PET), built from NITE's published practice exams.

## Language

### Source material

**Exam**:
One practice test published by NITE, identified by its season and year (e.g. Summer 2025).
_Avoid_: Test, practice test, moed

**Approved Exam**:
An Exam on NITE's public-use list - the only Exams the Question Bank may contain.
_Avoid_: Licensed exam, allowed exam

**Question Bank**:
Every Question, Question Set and Answer Key extracted from the Approved Exams, as shipped inside the app.
_Avoid_: Database, dataset, content

**Section**:
One timed part (פרק) of an Exam, belonging to exactly one Domain.
_Avoid_: Chapter, part, perek

**Domain**:
One of the two multiple-choice areas of the PET: Verbal or Quantitative. English and the Writing Task are not Domains.
_Avoid_: Subject, topic, category

**Question**:
One numbered item within a Section, with four Options.
_Avoid_: Item, problem

**Question Type**:
The NITE heading a Question falls under within its Domain (e.g. analogies, reading comprehension, chart inference).
_Avoid_: Category, subtype

**Topic**:
The mathematical subject of a Quantitative Question (e.g. algebra, geometry, probability).
_Avoid_: Subject, category, Question Type

**Passage**:
A reading text that several consecutive Questions in a Section refer to.
_Avoid_: Text, article, reading

**Chart**:
A graph or table that several consecutive Quantitative Questions refer to.
_Avoid_: Figure, diagram, graph

**Figure**:
A drawing that belongs to a single Question, such as a geometry diagram.
_Avoid_: Chart, image, diagram

**Formula Sheet**:
NITE's page of formulas and instructions that opens every Quantitative Section.
_Avoid_: Cheat sheet, instructions page

**Question Set**:
A Passage or Chart together with all the Questions that refer to it - always practiced as one block.
_Avoid_: Group, cluster, bundle

**Option**:
One of the four numbered choices printed under a Question.
_Avoid_: Answer, choice

**Answer Key**:
NITE's published table giving the Correct Option for every Question of an Exam.
_Avoid_: Solutions

**Correct Option**:
The Option the Answer Key marks as right for a Question.
_Avoid_: Answer, solution

**Proof Sheet**:
A review page for one Exam that shows each extracted Question next to its crop from the original PDF.
_Avoid_: Preview, QA report

### Practice

**Response**:
The Option the learner picked for a Question.
_Avoid_: Answer, guess

**Unseen Question**:
A Question the learner has no Response for. A skip does not count as a Response.
_Avoid_: New question, unanswered

**Mistake**:
A Question whose most recent Response was wrong. Answering it correctly later clears it.
_Avoid_: Error, wrong answer, miss

**Mode**:
A way of choosing which Questions to serve and how to present them.
_Avoid_: Game, quiz type

**Free Practice** (תרגול חופשי):
The Mode that serves Questions from one Domain - unseen first, then previous mistakes, each Question Set kept together - with the Correct Option revealed after each Response.
_Avoid_: Shuffle, drill, random mode

**Targeted Drill** (תרגול ממוקד):
The Mode that serves only the Questions of the Focuses the learner picked within one Domain, ordered like Free Practice. A Question Set is served with just its Questions in those Focuses, still with its Passage or Chart.
_Avoid_: Category practice, filtered practice

**Focus**:
One thing a Targeted Drill can be narrowed to: a Question Type, or one Topic of a Question Type whose Questions span several Topics (e.g. geometry within שאלות ובעיות).
_Avoid_: Category, subclass, filter
