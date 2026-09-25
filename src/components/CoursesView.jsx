import { useState } from 'react';
import { LESSONS, LESSON_STAGES, getLesson } from '../data/lessons.js';

export default function CoursesView({ progress, onToggleLesson, onNavigateLab }) {
  const [selectedId, setSelectedId] = useState(LESSONS[0].id);
  const [answer, setAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const selected = getLesson(selectedId);
  const completed = progress.completedLessons.includes(selectedId);
  const chooseLesson = (id) => {
    setSelectedId(id);
    setAnswer(null);
    setSubmitted(false);
  };
  return (
    <div className="view-stack courses-view">
      <div className="view-intro"><div><p className="eyebrow">COURSES / LEARN FROM THE RUN</p><h1>Explain what you just watched.</h1><p>Short lessons connect a change in the dish to a biological principle. Sandbox access stays open at every stage.</p></div><span className="progress-stamp">{progress.completedLessons.length}/{LESSONS.length} COMPLETE</span></div>
      <div className="course-start"><div><p className="eyebrow">START HERE</p><h2>DNA → phenotype → population</h2><p>Begin with the first lesson, then return to the lab and make the observation yourself.</p></div><button className="primary-control" type="button" onClick={() => chooseLesson(LESSONS[0].id)}>Start the first lesson</button></div>
      <div className="course-layout"><aside className="lesson-index" aria-label="Course lessons">{LESSON_STAGES.map((stage) => <div className="lesson-stage" key={stage.id}><p className="eyebrow">{stage.label}</p><span>{stage.description}</span>{LESSONS.filter((lesson) => lesson.stage === stage.id).map((lesson) => <button className={`lesson-link ${selectedId === lesson.id ? 'is-active' : ''}`} type="button" key={lesson.id} onClick={() => chooseLesson(lesson.id)}><span>{lesson.title}</span>{progress.completedLessons.includes(lesson.id) ? <b>✓</b> : <small>{lesson.duration}</small>}</button>)}</div>)}</aside><article className="lesson-detail"><div className="lesson-kicker"><span>{selected.stage.toUpperCase()}</span><span>{selected.duration}</span></div><h2>{selected.title}</h2><div className="lesson-step"><span className="step-number">01</span><div><h3>Concept</h3><p>{selected.concept}</p></div></div><div className="lesson-step"><span className="step-number">02</span><div><h3>Experiment</h3><p>{selected.experiment}</p><button className="text-control" type="button" onClick={() => onNavigateLab('lab')}>Open the lab →</button></div></div><div className="lesson-step"><span className="step-number">03</span><div><h3>Observation</h3><p>{selected.observation}</p></div></div><div className="lesson-step"><span className="step-number">04</span><div><h3>Explanation</h3><p>{selected.explanation}</p></div></div><div className="lesson-check"><p className="eyebrow">CHECK / MAKE THE CONNECTION</p><h3>{selected.question}</h3><div className="answer-list">{selected.options.map((option, index) => <label className={`answer-option ${answer === index ? 'is-selected' : ''} ${submitted && index === selected.answer ? 'is-correct' : ''}`} key={option}><input type="radio" name={`${selected.id}-answer`} value={index} checked={answer === index} onChange={() => { setAnswer(index); setSubmitted(false); }} /><span>{option}</span></label>)}</div><div className="check-actions"><button className="primary-control" type="button" disabled={answer === null} onClick={() => setSubmitted(true)}>Check answer</button><button className="secondary-control" type="button" onClick={() => onToggleLesson(selected.id)}>{completed ? 'Mark incomplete' : 'Mark lesson complete'}</button></div>{submitted && <p className={`answer-feedback ${answer === selected.answer ? 'is-correct' : ''}`} role="status">{answer === selected.answer ? 'Correct. The observation supports that answer.' : 'Not quite. Return to the experiment and trace the causal chain again.'}</p>}</div></article></div>
    </div>
  );
}
