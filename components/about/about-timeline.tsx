"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { ABOUT_TIMELINE_GROUPS } from "./about-timeline-milestones";

const DEFAULT_ERA_ID = ABOUT_TIMELINE_GROUPS[0]?.id ?? null;

export function AboutTimeline() {
  const [selectedId, setSelectedId] = useState<string | null>(DEFAULT_ERA_ID);
  const stageRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const selectedGroup = useMemo(() => {
    if (!selectedId) return null;
    return (
      ABOUT_TIMELINE_GROUPS.find((g) => g.id === selectedId) ?? null
    );
  }, [selectedId]);

  const selectEra = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  useLayoutEffect(() => {
    const root = stageRef.current;
    if (!root) return;

    const scrollEl = root.querySelector<HTMLElement>(".ab-timeline-stage-scroll");
    if (scrollEl) scrollEl.scrollTop = 0;

    root.querySelectorAll(".ab-tl-item").forEach((el) => {
      el.classList.remove("ab-tl-item--visible");
      (el as HTMLElement).style.transitionDelay = "";
    });

    if (!selectedId || !selectedGroup) return;

    const items = root.querySelectorAll<HTMLElement>(".ab-tl-item");
    if (items.length === 0) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const reveal = () => {
      if (reduceMotion) {
        items.forEach((el) => el.classList.add("ab-tl-item--visible"));
        return;
      }
      items.forEach((el, i) => {
        el.style.transitionDelay = `${i * 42}ms`;
        el.classList.add("ab-tl-item--visible");
      });
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(reveal);
    });
  }, [selectedId]);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const stage = stageRef.current;
    if (!nav || !stage) return;

    const syncStageHeightToNav = () => {
      const h = Math.round(nav.getBoundingClientRect().height);
      if (h <= 0) return;
      stage.style.height = `${h}px`;
      stage.style.maxHeight = `${h}px`;
    };

    syncStageHeightToNav();
    const ro = new ResizeObserver(syncStageHeightToNav);
    ro.observe(nav);
    return () => {
      ro.disconnect();
      stage.style.height = "";
      stage.style.maxHeight = "";
    };
  }, [selectedId]);

  return (
    <section
      className="ab-timeline"
      id="timeline"
      aria-labelledby="ab-timeline-title"
    >
      <div className="ab-timeline-grid-bg" aria-hidden="true" />
      <div className="ab-timeline-glow ab-timeline-glow--1" aria-hidden="true" />
      <div className="ab-timeline-glow ab-timeline-glow--2" aria-hidden="true" />

      <div className="ab-inner ab-timeline-inner">
        <header className="ab-timeline-head">
          <div className="section-tag ab-timeline-tag">
            <span className="tag-line" />
            <span className="tag-text">Kilometre taşları</span>
          </div>
          <h2 id="ab-timeline-title" className="ab-timeline-title">
            Teknoloji ve <em>yıllar</em>
          </h2>
          <p className="ab-timeline-lead">
            Küresel büyüme ve inovasyon yolculuğumuzdan seçili kilometre taşları.
          </p>
        </header>

        <div className="ab-timeline-split">
          <div
            ref={stageRef}
            className="ab-timeline-stage"
            aria-live="polite"
            aria-label="Seçilen döneme ait kilometre taşları"
          >
            {!selectedGroup ? (
              <div className="ab-tl-empty">
                <p className="ab-tl-empty-title">Dönem seçin</p>
                <p className="ab-tl-empty-desc">
                  Sağdaki yıllar aralığından birini seçerek o döneme ait
                  kilometre taşlarını burada görüntüleyebilirsiniz.
                </p>
              </div>
            ) : (
              <div className="ab-timeline-stage-scroll">
                <ul key={selectedGroup.id} className="ab-tl-list">
                  {selectedGroup.milestones.map((m, i) => (
                    <li
                      key={m.year}
                      className={
                        i % 2 === 0
                          ? "ab-tl-item ab-tl-item--left"
                          : "ab-tl-item ab-tl-item--right"
                      }
                    >
                      <div className="ab-tl-side ab-tl-side--text">
                        <div className="ab-tl-card">
                          <div className="ab-tl-year-row">
                            <span className="ab-tl-year">{m.year}</span>
                          </div>
                          <ul className="ab-tl-events">
                            {m.events.map((line, j) => (
                              <li key={j}>{line}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="ab-tl-rail" aria-hidden="true">
                        <span className="ab-tl-node">
                          <span className="ab-tl-node-core" />
                          <span className="ab-tl-node-ring" />
                        </span>
                      </div>
                      <div
                        className="ab-tl-side ab-tl-side--spacer"
                        aria-hidden="true"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <nav
            ref={navRef}
            className="ab-timeline-era-nav"
            aria-label="Dönem seçimi"
          >
            <div className="ab-tl-accordion">
              {ABOUT_TIMELINE_GROUPS.map((group) => {
                const isSelected = selectedId === group.id;
                const count = group.milestones.length;
                return (
                  <div
                    key={group.id}
                    className={`ab-tl-acc-item${isSelected ? " is-active" : ""}`}
                  >
                    <button
                      type="button"
                      className={`ab-tl-acc-trigger${isSelected ? " is-selected" : ""}`}
                      aria-pressed={isSelected}
                      id={`ab-tl-era-${group.id}`}
                      onClick={() => selectEra(group.id)}
                    >
                      <span className="ab-tl-acc-trigger-text">
                        <span className="ab-tl-acc-era">{group.title}</span>
                        <span className="ab-tl-acc-meta">
                          {count} kayıt · {group.from}–{group.to}
                        </span>
                      </span>
                      <span
                        className="ab-tl-era-indicator"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
}
