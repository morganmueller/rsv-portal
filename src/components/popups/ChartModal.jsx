import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./ChartModal.css"; 

const ChartModal = ({ title, isOpen, onClose, children, maxWidth = 980 }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement;

    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const focusables = ref.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables?.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus(); e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus(); e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    setTimeout(() => ref.current?.querySelector(".modal-close")?.focus(), 0);

    return () => {
      document.removeEventListener("keydown", handleKey);
      prev?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="chart-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className="chart-modal" style={{ maxWidth }}>
        <div className="chart-modal-header">
          <h3 className="chart-modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close large chart">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="chart-modal-body">{children}</div>
      </div>
    </div>
  );
};

ChartModal.propTypes = {
  title: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  maxWidth: PropTypes.number,
};

export default ChartModal;
