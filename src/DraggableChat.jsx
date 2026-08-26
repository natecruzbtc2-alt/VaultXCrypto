import { useState, useEffect, useRef, useCallback } from "react";

export default function DraggableChat() {
  const [pos,     setPos]     = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  const [dragging, setDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [unread,  setUnread]  = useState(0);
  const [open,    setOpen]    = useState(false);
  const ref     = useRef(null);
  const dragRef = useRef({ startX:0, startY:0, origX:0, origY:0, moved:false });

  // Hide Tawk's default widget bubble — we use our own
  useEffect(() => {
    const hide = () => {
      if (window.Tawk_API) {
        window.Tawk_API.hideWidget?.();
      }
    };
    hide();
    const id = setInterval(hide, 500);
    setTimeout(() => clearInterval(id), 8000);

    // Listen for unread messages
    if (window.Tawk_API) {
      window.Tawk_API.onUnreadCountChanged = (count) => setUnread(count);
    }

    // Save/load position from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem("vx_chat_pos"));
      if (saved) setPos(saved);
    } catch(e) {}
  }, []);

  // ── DRAG ──────────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      moved: false,
    };
    setDragging(true);
  }, [pos]);

  const onTouchStart = useCallback((e) => {
    const t = e.touches[0];
    dragRef.current = {
      startX: t.clientX,
      startY: t.clientY,
      origX: pos.x,
      origY: pos.y,
      moved: false,
    };
    setDragging(true);
  }, [pos]);

  useEffect(() => {
    if (!dragging) return;

    const onMouseMove = (e) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
      const newX = Math.max(30, Math.min(window.innerWidth  - 30, dragRef.current.origX + dx));
      const newY = Math.max(30, Math.min(window.innerHeight - 30, dragRef.current.origY + dy));
      setPos({ x: newX, y: newY });
      setHasMoved(dragRef.current.moved);
    };

    const onTouchMove = (e) => {
      const t = e.touches[0];
      const dx = t.clientX - dragRef.current.startX;
      const dy = t.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
      const newX = Math.max(30, Math.min(window.innerWidth  - 30, dragRef.current.origX + dx));
      const newY = Math.max(30, Math.min(window.innerHeight - 30, dragRef.current.origY + dy));
      setPos({ x: newX, y: newY });
      e.preventDefault();
    };

    const onUp = () => {
      setDragging(false);
      try { localStorage.setItem("vx_chat_pos", JSON.stringify(pos)); } catch(e) {}
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend",  onUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend",  onUp);
    };
  }, [dragging, pos]);

  // ── CLICK TO OPEN CHAT ────────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    if (dragRef.current.moved) return; // was a drag, not a click
    if (window.Tawk_API && window.Tawk_API.maximize) {
      window.Tawk_API.maximize();
      setUnread(0);
    } else {
      window.open("https://tawk.to/chat/6a2e5fe88b30661d42bef351/1jr2id950", "_blank");
    }
  }, []);

  return (
    <>
      <style>{`
        @keyframes vxChatPulse {
          0%   { box-shadow: 0 0 0 0 rgba(255,200,0,.6), 0 4px 20px rgba(0,0,0,.4); }
          70%  { box-shadow: 0 0 0 12px rgba(255,200,0,0), 0 4px 20px rgba(0,0,0,.4); }
          100% { box-shadow: 0 0 0 0 rgba(255,200,0,0), 0 4px 20px rgba(0,0,0,.4); }
        }
        @keyframes vxChatBounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
        .vx-chat-btn {
          animation: vxChatPulse 2.5s infinite;
        }
        .vx-chat-btn:hover {
          animation: none !important;
          box-shadow: 0 0 0 3px rgba(255,200,0,.4), 0 8px 30px rgba(0,0,0,.5) !important;
          transform: scale(1.08);
        }
        .vx-chat-icon {
          animation: vxChatBounce 2s ease-in-out infinite;
        }
      `}</style>

      <div
        ref={ref}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onClick={handleClick}
        className="vx-chat-btn"
        style={{
          position:    "fixed",
          left:        pos.x - 28,
          top:         pos.y - 28,
          width:       56,
          height:      56,
          borderRadius:"50%",
          background:  "linear-gradient(135deg,#e6b400,#ffd633)",
          cursor:      dragging ? "grabbing" : "grab",
          zIndex:      9998,
          display:     "flex",
          alignItems:  "center",
          justifyContent:"center",
          userSelect:  "none",
          WebkitUserSelect:"none",
          transition:  dragging ? "none" : "transform .15s, box-shadow .15s",
          touchAction: "none",
        }}
      >
        {/* Chat icon */}
        <span className={dragging ? "" : "vx-chat-icon"} style={{ fontSize:22, lineHeight:1, color:"#000" }}>
          💬
        </span>

        {/* Unread badge */}
        {unread > 0 && (
          <div style={{
            position:    "absolute",
            top:         -4, right: -4,
            width:       20, height: 20,
            borderRadius:"50%",
            background:  "#ef4444",
            color:       "#fff",
            fontSize:    11,
            fontWeight:  700,
            display:     "flex",
            alignItems:  "center",
            justifyContent:"center",
            border:      "2px solid #0a0a0a",
            fontFamily:  "sans-serif",
          }}>
            {unread > 9 ? "9+" : unread}
          </div>
        )}

        {/* Drag hint tooltip */}
        {!hasMoved && !dragging && (
          <div style={{
            position:    "absolute",
            bottom:      64,
            right:       0,
            background:  "#1a1a1a",
            border:      "1px solid rgba(255,200,0,.3)",
            borderRadius:10,
            padding:     "6px 12px",
            fontSize:    11,
            color:       "#ffc800",
            whiteSpace:  "nowrap",
            pointerEvents:"none",
            fontFamily:  "sans-serif",
            boxShadow:   "0 4px 16px rgba(0,0,0,.4)",
          }}>
            💬 Live Support · drag me!
          </div>
        )}
      </div>
    </>
  );
}
