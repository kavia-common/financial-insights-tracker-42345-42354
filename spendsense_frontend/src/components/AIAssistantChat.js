import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  answerFromDashboard,
  DASHBOARD_QA_FALLBACK_TEXT,
  getDashboardClarification,
} from "../utils/answerFromDashboard";
import { explainTrend } from "../utils/explainTrend";
import { summarizeDashboard } from "../utils/summarizeDashboard";
import { generateExecutiveSummary } from "../utils/executiveSummary";
import { buildDashboardSnapshot } from "../utils/snapshot";
import { getMockTransactions } from "../data/mockData";

/**
 * Deterministic, local-only “dashboard snapshot” provider.
 * IMPORTANT: The assistant must answer only from dashboard-visible data.
 *
 * Today this app uses mock transactions in Dashboard; we mirror that here so the assistant can be
 * opened from any route while still staying within the "visible dashboard data" constraint.
 *
 * If/when the app switches to real data, AppLayout should pass the current dashboard snapshot down
 * instead of computing it here.
 */
function computeKPIs(transactions) {
  const outflow = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const inflow = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const net = inflow - outflow;
  const flagged = transactions.filter((t) => t.status === "Flagged").length;
  return { outflow, inflow, net, flagged };
}

function randomDelayMs(min = 200, max = 400) {
  const lo = Math.max(0, Number(min) || 0);
  const hi = Math.max(lo, Number(max) || lo);
  return Math.floor(lo + Math.random() * (hi - lo + 1));
}

function normalizeWhyQuestion(q) {
  // Small, deterministic normalizer for "why" detection.
  return String(q || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isWhyHappeningQuestion(q) {
  const n = normalizeWhyQuestion(q);
  if (!n) return false;

  if (n === "why" || n === "why this" || n === "why that") return true;

  const hasWhy = n.startsWith("why ") || n === "why";
  if (!hasWhy) return false;

  if (n.includes("why is this happening")) return true;
  if (n.includes("why is that happening")) return true;
  if (n.includes("why is it happening")) return true;
  if (n.includes("why is this") || n.includes("why is that") || n.includes("why is it")) return true;

  return false;
}

function firstFocusable(container) {
  if (!container) return null;
  const el = container.querySelector(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  return el || null;
}

function focusableElements(container) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

/**
 * Simple inlined icon to avoid introducing new deps.
 */
function ChatIcon({ title }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
      className="aiChatFabIcon"
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M7.5 18.5 4 20V6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16h-7.4L7.5 18.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 8.5h9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7.5 11.5h7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// PUBLIC_INTERFACE
export function AIAssistantChat() {
  /**
   * Floating AI assistant chat:
   * - FAB persists across all routes (mount at AppLayout level)
   * - Right slide-in panel with focus management + ESC close
   * - Answers use existing dashboard utilities ONLY (no API calls)
   * - Includes suggestion chips and header quick actions:
   *    - Summarize Dashboard
   *    - Executive Summary
   */
  const [open, setOpen] = useState(false);

  // Chat state
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  // Clarification state (if user intent is unclear)
  const [clarification, setClarification] = useState(null);
  const firstClarifyChipRef = useRef(null);

  // Remember prior context so a generic "why" can attach to last discussed metric.
  const [lastContext, setLastContext] = useState(null);

  const [messages, setMessages] = useState(() => {
    return [
      {
        id: `m-${Math.random().toString(16).slice(2)}`,
        role: "assistant",
        kind: "text",
        text: "Hi — ask a question about what’s shown on the dashboard. I’ll answer only from the data currently visible in the app.",
      },
    ];
  });

  const fabRef = useRef(null);
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef(null);
  const timerRef = useRef(null);

  const panelTitleId = useMemo(() => `ai-chat-title-${Math.random().toString(16).slice(2)}`, []);

  // Build a deterministic snapshot from the same source as Dashboard (mock data).
  const snapshot = useMemo(() => {
    const transactions = getMockTransactions();
    const kpis = computeKPIs(transactions);
    return buildDashboardSnapshot({ transactions, kpis });
  }, []);

  const suggestedGroups = useMemo(() => {
    return [
      {
        title: "Performance-related",
        questions: ["What’s my monthly outflow?", "Which category is costing me the most?"],
      },
      {
        title: "Trend analysis",
        questions: ["Are my weekly expenses going up or down?", "Why is this happening?"],
      },
      {
        title: "Comparison-based",
        questions: ["How does this month compare to last month?", "Which category changed the most vs last month?"],
      },
      {
        title: "Risk or anomaly detection",
        questions: ["Any unusual or high-risk transactions?", "Did any alerts trigger today?"],
      },
    ];
  }, []);

  const appendMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  const scrollToBottomSoon = () => {
    // Allow layout to settle first.
    setTimeout(() => {
      const el = messagesRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, 0);
  };

  const inferContextFromAnswer = (q, r) => {
    // Only store minimal, safe hints. We do not store or infer anything beyond what the snapshot already contains.
    const normalized = String(q || "").toLowerCase();

    // If user mentioned a visible category explicitly, keep it as focus.
    const topCats = snapshot?.tables?.topCategories;
    if (Array.isArray(topCats) && topCats.length > 0) {
      const match = topCats.find((c) => c?.category && normalized.includes(String(c.category).toLowerCase()));
      if (match?.category) {
        return { focus: { type: "category", category: match.category }, fromQuestion: q };
      }
    }

    // If the assistant used certain fields, store a focus hint.
    const used = Array.isArray(r?.usedFields) ? r.usedFields : [];
    if (used.includes("kpis.outflow")) return { focus: { type: "kpi", metric: "outflow" }, fromQuestion: q };
    if (used.includes("kpis.inflow")) return { focus: { type: "kpi", metric: "inflow" }, fromQuestion: q };
    if (used.includes("kpis.net")) return { focus: { type: "kpi", metric: "net" }, fromQuestion: q };
    if (used.includes("series.spendingByDay")) return { focus: { type: "trend", metric: "spendingByDay" }, fromQuestion: q };

    return null;
  };

  const closePanel = () => setOpen(false);
  const openPanel = () => setOpen(true);
  const togglePanel = () => setOpen((v) => !v);

  const onAsk = (questionText) => {
    const q = String(questionText ?? "").trim();

    // Reset clarification on new attempt
    setClarification(null);

    if (!q) return;

    // Add user message immediately
    const userMsg = {
      id: `m-${Math.random().toString(16).slice(2)}`,
      role: "user",
      kind: "text",
      text: q,
    };
    appendMessage(userMsg);
    scrollToBottomSoon();

    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      // Keep "why is this happening?" behavior consistent with DashboardQA.
      if (isWhyHappeningQuestion(q)) {
        const r = explainTrend({ snapshot, context: lastContext });
        const assistantMsg = {
          id: `m-${Math.random().toString(16).slice(2)}`,
          role: "assistant",
          kind: "answer",
          answerResult: r,
          text: null,
        };
        appendMessage(assistantMsg);
        scrollToBottomSoon();
        setLoading(false);
        return;
      }

      const r = answerFromDashboard({ question: q, snapshot });

      const clarificationCandidate = getDashboardClarification({
        question: q,
        snapshot,
        suggestionPool: suggestedGroups.map((g) => g.questions),
        mappedAnswerText: r?.answer,
      });

      if (clarificationCandidate?.isUnclear) {
        // Show a clarification prompt as the assistant message, and show chips.
        setClarification(clarificationCandidate);

        const assistantMsg = {
          id: `m-${Math.random().toString(16).slice(2)}`,
          role: "assistant",
          kind: "text",
          text: clarificationCandidate.prompt,
        };
        appendMessage(assistantMsg);
        scrollToBottomSoon();
        setLoading(false);
        return;
      }

      const inferred = inferContextFromAnswer(q, r);
      if (inferred) setLastContext(inferred);

      const assistantMsg = {
        id: `m-${Math.random().toString(16).slice(2)}`,
        role: "assistant",
        kind: "answer",
        answerResult: r,
        text: null,
      };
      appendMessage(assistantMsg);
      scrollToBottomSoon();
      setLoading(false);
    }, randomDelayMs(200, 400));
  };

  const onRunSummarizeDashboard = () => {
    // These actions must also only use dashboard-visible data (same as Dashboard.js).
    const transactions = getMockTransactions();
    const kpis = computeKPIs(transactions);

    appendMessage({
      id: `m-${Math.random().toString(16).slice(2)}`,
      role: "user",
      kind: "text",
      text: "Summarize Dashboard",
    });
    scrollToBottomSoon();

    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const s = summarizeDashboard({ transactions, kpis });
      const lines = [
        ...(Array.isArray(s?.overallSummary) ? s.overallSummary : []),
        "",
        "Key insights:",
        ...(Array.isArray(s?.keyInsights) ? s.keyInsights.map((x) => `- ${x}`) : []),
        "",
        "Trends & observations:",
        ...(Array.isArray(s?.trends) ? s.trends.map((x) => `- ${x}`) : []),
      ].filter((x) => x !== null && x !== undefined);

      appendMessage({
        id: `m-${Math.random().toString(16).slice(2)}`,
        role: "assistant",
        kind: "text",
        text: lines.join("\n").trim() || "No summary is available from the current dashboard view.",
      });
      scrollToBottomSoon();
      setLoading(false);
    }, randomDelayMs(200, 400));
  };

  const onRunExecutiveSummary = () => {
    appendMessage({
      id: `m-${Math.random().toString(16).slice(2)}`,
      role: "user",
      kind: "text",
      text: "Executive Summary",
    });
    scrollToBottomSoon();

    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const bullets = generateExecutiveSummary(snapshot);
      const text = Array.isArray(bullets) && bullets.length > 0 ? `Highlights:\n- ${bullets.join("\n- ")}` : "No executive summary items are available from the current dashboard view.";
      appendMessage({
        id: `m-${Math.random().toString(16).slice(2)}`,
        role: "assistant",
        kind: "text",
        text,
      });
      scrollToBottomSoon();
      setLoading(false);
    }, randomDelayMs(200, 400));
  };

  // Focus mgmt + ESC close + basic focus trap (pattern matches existing summary panels)
  useEffect(() => {
    if (!open) return undefined;

    const prevActive = document.activeElement;

    const t = setTimeout(() => {
      inputRef.current?.focus?.();
    }, 0);

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePanel();
        return;
      }

      if (e.key !== "Tab") return;

      const items = focusableElements(panelRef.current);
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !panelRef.current.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);
      prevActive?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (clarification?.isUnclear) {
      firstClarifyChipRef.current?.focus?.();
    }
  }, [clarification]);

  const onSubmit = (e) => {
    e?.preventDefault?.();
    if (loading) return;

    const q = String(draft || "").trim();
    setDraft("");
    onAsk(q);
  };

  const onPickSuggestion = (q) => {
    // Show transparency by also putting the question in the chat as a user message.
    setDraft("");
    onAsk(q);
  };

  const renderAssistantText = (text) => {
    const lines = String(text || "").split("\n");
    return lines.map((line, idx) => (
      <div key={`${idx}-${line}`}>{line === "" ? <div style={{ height: 8 }} /> : line}</div>
    ));
  };

  const renderAnswerResult = (r) => {
    const answerText = r?.answer || DASHBOARD_QA_FALLBACK_TEXT;
    const isFallback = answerText === DASHBOARD_QA_FALLBACK_TEXT;

    return (
      <div className="aiChatAnswer">
        <div className={`aiChatAnswerMain ${isFallback ? "aiChatAnswerMuted" : ""}`}>
          {String(answerText)
            .split("\n")
            .map((line, idx) => (
              <div key={String(idx)}>{line}</div>
            ))}
        </div>

        {Array.isArray(r?.why) && r.why.length > 0 ? (
          <div className="aiChatAnswerWhy">
            <div className="aiChatMiniTitle">Why</div>
            <ul className="aiChatList">
              {r.why.map((w, idx) => (
                <li key={String(idx)}>{w}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {r?.followUp ? (
          <div className="aiChatAnswerFollowUp">
            <div className="aiChatMiniTitle">Suggested follow-up</div>
            <div className="aiChatFollowUpChip">{r.followUp}</div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        className="aiChatFab"
        onClick={() => {
          // If opening: open then focus input (effect handles focus).
          togglePanel();
        }}
        aria-label={open ? "Close AI assistant chat" : "Open AI assistant chat"}
        aria-haspopup="dialog"
        aria-expanded={open ? "true" : "false"}
        aria-controls="ai-chat-panel"
        title={open ? "Close AI chat" : "Ask the AI assistant"}
      >
        <ChatIcon title="AI chat" />
      </button>

      {/* Overlay + sliding panel */}
      <div
        className={`aiChatOverlay ${open ? "aiChatOverlayOpen" : ""}`}
        ref={overlayRef}
        role="presentation"
        aria-hidden={open ? "false" : "true"}
        onMouseDown={(e) => {
          if (!open) return;
          if (e.target === overlayRef.current) closePanel();
        }}
      >
        <section
          id="ai-chat-panel"
          className={`aiChatPanel ${open ? "aiChatPanelOpen" : ""}`}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={panelTitleId}
          aria-label="AI assistant chat panel"
        >
          <header className="aiChatHeader">
            <div className="aiChatHeaderLeft">
              <div className="aiChatKicker">AI Assistant</div>
              <h2 id={panelTitleId} className="aiChatTitle">
                Chat
              </h2>
              <div className="aiChatSub">
                Answers are limited to dashboard-visible data.
              </div>
            </div>

            <div className="aiChatHeaderRight" aria-label="Chat actions">
              <button
                type="button"
                className="btn btnPrimary btnGradient aiChatHeaderBtn"
                onClick={onRunSummarizeDashboard}
                disabled={loading}
                aria-label="Summarize dashboard in chat"
                title="Generate a short summary from the current dashboard data"
              >
                Summarize Dashboard
              </button>

              <button
                type="button"
                className="btn btnPrimary aiChatHeaderBtn"
                onClick={onRunExecutiveSummary}
                disabled={loading}
                aria-label="Generate executive summary in chat"
                title="Generate an executive-level summary from the current dashboard data"
              >
                Executive Summary
              </button>

              <button
                type="button"
                className="btn btnGhost"
                onClick={closePanel}
                aria-label="Close chat panel"
                title="Close"
              >
                Close
              </button>
            </div>
          </header>

          <div className="aiChatBody">
            <div className="aiChatMessages" ref={messagesRef} role="log" aria-label="Chat messages" aria-live="polite">
              {messages.map((m) => {
                const isUser = m.role === "user";

                return (
                  <div
                    key={m.id}
                    className={`aiChatMsgRow ${isUser ? "aiChatMsgRowUser" : "aiChatMsgRowAssistant"}`}
                  >
                    <div className={`aiChatBubble ${isUser ? "aiChatBubbleUser" : "aiChatBubbleAssistant"}`}>
                      {m.kind === "answer" ? renderAnswerResult(m.answerResult) : renderAssistantText(m.text)}
                    </div>
                  </div>
                );
              })}

              {loading ? (
                <div className="aiChatMsgRow aiChatMsgRowAssistant" aria-label="Assistant typing">
                  <div className="aiChatBubble aiChatBubbleAssistant">
                    <div className="aiChatTyping">
                      <div className="skeleton skeletonMuted" style={{ height: 12, width: 180, borderRadius: 10 }} />
                      <div style={{ height: 8 }} />
                      <div className="skeleton skeletonMuted" style={{ height: 12, width: 240, borderRadius: 10 }} />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Suggested question chips */}
            <div className="aiChatSuggestions" aria-label="Suggested questions">
              {clarification?.isUnclear ? (
                <div className="aiChatSuggestionGroup" aria-label="Example questions">
                  <div className="aiChatSuggestionTitle">Examples</div>
                  <div className="aiChatSuggestionChips">
                    {clarification.suggestions.slice(0, 2).map((sq, idx) => (
                      <button
                        key={sq}
                        ref={idx === 0 ? firstClarifyChipRef : null}
                        type="button"
                        className="chip aiChatSuggestionChip"
                        aria-label={`Ask: ${sq}`}
                        disabled={loading}
                        onClick={() => onPickSuggestion(sq)}
                      >
                        {sq}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                suggestedGroups.map((group) => (
                  <div key={group.title} className="aiChatSuggestionGroup">
                    <div className="aiChatSuggestionTitle">{group.title}</div>
                    <div className="aiChatSuggestionChips">
                      {group.questions.map((sq) => (
                        <button
                          key={sq}
                          type="button"
                          className="chip aiChatSuggestionChip"
                          aria-label={`Ask: ${sq}`}
                          disabled={loading}
                          onClick={() => onPickSuggestion(sq)}
                        >
                          {sq}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input row */}
            <form className="aiChatComposer" onSubmit={onSubmit} aria-label="Chat input">
              <label className="label" htmlFor="ai-chat-input">
                Ask a question
              </label>
              <div className="aiChatComposerRow">
                <input
                  ref={inputRef}
                  id="ai-chat-input"
                  className="input aiChatInput"
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder='e.g., "What is my monthly outflow?"'
                  aria-label="Chat message input"
                />
                <button
                  type="submit"
                  className="btn btnPrimary btnGradient"
                  disabled={loading || String(draft || "").trim().length === 0}
                  aria-label="Send message"
                  title="Send"
                >
                  Send
                </button>
              </div>

              <div className="helper aiChatHint">
                Tip: Press ESC to close. Use the chips for quick questions.
              </div>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}
