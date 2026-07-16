import React from "react";
import { Link } from "react-router-dom";
import { IconArrowLeft, IconCheck } from "../components/Icons";
import { VERSION, CHANGELOG } from "../version";
import "../styles/Pages-Legal.css";     // shared content-page shell (back link, eyebrow, title)
import "../styles/Pages-Changelog.css";

// Split a comma-separated note into individual bullet points.
function toItems(note) {
  return note
    .split(/,\s*(?![^()]*\))/) // split on commas not inside parentheses
    .map((s) => s.trim())
    .filter(Boolean);
}

function bumpKind(version, prevVersion) {
  if (!prevVersion) return "Initial";
  const [maj, min] = version.split(".").map(Number);
  const [pMaj, pMin] = prevVersion.split(".").map(Number);
  if (maj > pMaj) return "Major";
  if (min > pMin) return "Minor";
  return "Patch";
}

export default function ChangelogPage() {
  return (
    <div className="pg pg-changelog">
      <div className="changelog-article">
        <Link to="/" className="legal-back">
          <IconArrowLeft size={15} />
          Back to home
        </Link>

        <div className="changelog-head">
          <span className="legal-eyebrow">Release Notes</span>
          <h1 className="legal-title">What's changed</h1>
          <p className="changelog-intro">
            Every version of BadgeGen and what shipped in it. Currently running{" "}
            <span className="changelog-current-badge">v{VERSION}</span>.
          </p>
        </div>

        <ol className="changelog-timeline">
          {CHANGELOG.map((entry, i) => {
            const prev = CHANGELOG[i + 1]; // list is newest-first
            const kind = bumpKind(entry.version, prev?.version);
            const isLatest = i === 0;
            return (
              <li key={entry.version} className="cl-entry">
                <div className="cl-marker">
                  <span className={`cl-dot${isLatest ? " cl-dot-latest" : ""}`} />
                </div>
                <div className="cl-body">
                  <div className="cl-header">
                    <span className="cl-version">v{entry.version}</span>
                    <span className={`cl-tag cl-tag-${kind.toLowerCase()}`}>{kind}</span>
                    {isLatest && <span className="cl-tag cl-tag-latest">Latest</span>}
                    <span className="cl-date">{entry.date}</span>
                  </div>
                  <ul className="cl-items">
                    {toItems(entry.note).map((item) => (
                      <li key={item} className="cl-item">
                        <IconCheck size={13} className="cl-item-icon" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
