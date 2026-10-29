/* ==========================================================================
   apps.js — built-in applications
   ========================================================================== */
'use strict';

/* shared shell state (Recycle Bin etc.) */
const Shell = {
  bin: [],
  binFull() { return this.bin.length > 0; },
  addToBin(item) { this.bin.push(item); Sound.play('recycle'); if (Shell._refresh) Shell._refresh(); },
  restoreAll() {
    const items = this.bin.splice(0);
    Sound.play('restore'); if (Shell._refresh) Shell._refresh();
    return items;
  },
  emptyBin() { this.bin = []; Sound.play('recycle'); if (Shell._refresh) Shell._refresh(); }
};

(() => {
  const el = WM.el, iconImg = WM.iconImg;

  /* ================================================================
     NOTEPAD
  ================================================================ */
  const NOTEPAD_TEXTS = {
    'secret.txt': 'DO NOT OPEN!!!\r\n\r\nOK since you opened it:\r\nthe password to my myspace is ******** (jerk)\r\n\r\n- me',
    'New Text Document.txt': '',
    'readme.txt': 'Windows XP - Retro Edition\r\n=========================\r\n\r\nTip: MSN Messenger & ICQ are on the desktop.\r\nSign in and check your messages!\r\n\r\nTip: Ctrl+Alt+Del opens Task Manager.\r\nTip: Try "format c:" in the Command Prompt.'
  };

  APPS.notepad = {
    launch(args) {
      args = args || {};
      const ta = el('textarea');
      ta.style.cssText = 'flex:1;border:none;resize:none;outline:none;font-family:Lucida Console,\'Courier New\',monospace;font-size:12px;padding:2px 4px;';
      ta.value = args.text != null ? args.text : (NOTEPAD_TEXTS[args.name] || '');
      let fileName = args.name || 'Untitled';
      let dirty = false;

      const win = WM.openWindow({
        title: fileName + ' - Notepad', icon: ICON.notepad, app: 'notepad',
        width: 520, height: 380,
        menubar: [
          { label: '<u>F</u>ile', items: () => [
            { label: 'New', action: () => { ta.value = ''; dirty = false; setTitle('Untitled'); } },
            { label: 'Save', action: save },
            { label: 'Save As...', action: save },
            '-',
            { label: 'Exit', action: () => win.close() }
          ]},
          { label: '<u>E</u>dit', items: () => [
            { label: 'Undo', action: () => document.execCommand('undo') },
            '-',
            { label: 'Time/Date', action: () => { const d = new Date(); ta.value += d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + ' ' + d.toLocaleDateString(); dirty = true; } }
          ]},
          { label: '<u>F</u>ormat', items: () => [
            { label: 'Word Wrap', checked: true, action: () => msg('Notepad', 'Word Wrap is already enabled.', { type: 'info' }) }
          ]},
          { label: '<u>H</u>elp', items: () => [
            { label: 'About Notepad', action: () => WM.msg('About Notepad', 'Microsoft (R) Notepad\nVersion 5.1 (Build 2600)', { type: 'info' }) }
          ]}
        ],
        body: ta
      });

      function setTitle(t) { win.setTitle(t + ' - Notepad'); }
      function save() {
        dirty = false;
        WM.msg('Notepad', 'Your file "' + fileName + '" has been saved to My Documents.', { type: 'info' });
      }
      ta.addEventListener('input', () => { dirty = true; if (!fileName.startsWith('*')) { fileName = fileName; setTitle('*' + fileName); } });
      win.onBeforeClose = () => {
        if (!dirty) return true;
        return WM.dialog({ title: 'Notepad', text: 'The text in the ' + fileName + ' file has changed.\n\nDo you want to save the changes?',
          icon: ICON.alert, buttons: [{ label: 'Yes', value: true, def: true }, { label: 'No', value: true }, { label: 'Cancel', value: false }] })
          .then(v => { if (v && dirty) save(); return v; });
      };
      setTimeout(() => ta.focus(), 60);
      return win;
    }
  };

  /* ================================================================
     CALCULATOR
  ================================================================ */
  APPS.calc = {
    launch() {
      const body = el('div');
      body.style.cssText = 'background:#ECE9D8;padding:6px;display:flex;flex-direction:column;gap:6px;height:100%;';
      body.innerHTML = `
        <div style="display:flex;gap:4px;">
          <div style="background:#fff;border:1px inset #999;flex:1;text-align:right;padding:3px 6px;font-family:Tahoma;font-size:14px;" id="calc-disp">0.</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;" id="calc-keys"></div>`;
      const win = WM.openWindow({ title: 'Calculator', icon: ICON.calc, app: 'calc', width: 260, height: 240, minimizable: false, maximizable: false, resizable: false, body });
      const disp = body.querySelector('#calc-disp');
      let acc = null, op = null, cur = '0', fresh = true;
      const keys = ['MC','MR','MS','M+','%','CE','C','±','√','7','8','9','/','←','4','5','6','*','1/x','1','2','3','-','=','0','.','+'];
      const grid = body.querySelector('#calc-keys');
      keys.forEach(k => {
        const b = el('button', 'xp-btn'); b.textContent = k; b.style.cssText = 'min-width:0;padding:4px 0;font-weight:' + (/[0-9.\-+*\/=]/.test(k) ? 'bold' : 'normal') + ';color:' + (/[A-Z]/.test(k) ? '#c00' : '#000');
        b.addEventListener('click', () => hit(k));
        grid.append(b);
      });
      function show(v) { disp.textContent = String(v).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '.') || '0.'; }
      function hit(k) {
        Sound.play('click');
        if (k === 'C') { acc = null; op = null; cur = '0'; fresh = true; show('0.'); return; }
        if (k === 'CE') { cur = '0'; fresh = true; show('0.'); return; }
        if (k === '←') { cur = cur.length > 1 ? cur.slice(0, -1) : '0'; show(cur); return; }
        if (k === '±') { cur = cur.startsWith('-') ? cur.slice(1) : '-' + cur; show(cur); return; }
        if (k === '√') { cur = String(Math.sqrt(parseFloat(cur))); show(cur); fresh = true; return; }
        if (k === '1/x') { cur = String(1 / parseFloat(cur)); show(cur); fresh = true; return; }
        if (k === '%') { cur = String(parseFloat(cur) / 100); show(cur); fresh = true; return; }
        if (/[0-9.]/.test(k)) { if (fresh) { cur = k === '.' ? '0.' : k; fresh = false; } else if (cur === '0' && k !== '.') cur = k; else cur += k; show(cur); return; }
        const apply = () => {
          const b = parseFloat(cur);
          if (op && acc != null) {
            acc = op === '+' ? acc + b : op === '-' ? acc - b : op === '*' ? acc * b : op === '/' ? (b === 0 ? NaN : acc / b) : b;
          } else acc = b;
        };
        if (k === '=') { apply(); if (isNaN(acc)) { WM.msg('Calculator', 'Cannot divide by zero.', { type: 'error' }); acc = null; cur = '0'; } else cur = String(acc); acc = null; op = null; fresh = true; show(cur); return; }
        apply(); if (isNaN(acc)) { WM.msg('Calculator', 'Cannot divide by zero.', { type: 'error' }); acc = null; cur = '0'; show('0.'); return; }
        op = k; cur = String(acc); fresh = true; show(cur);
      }
      show('0.');
      return win;
    }
  };

  /* ================================================================
     PAINT
  ================================================================ */
  APPS.paint = {
    launch(args) {
      const W = 560, H = 330;
      const body = el('div');
      body.style.cssText = 'display:flex;height:100%;background:#ECE9D8;';
      const canvas = el('canvas'); canvas.width = W; canvas.height = H;
      canvas.style.cssText = 'background:#fff;cursor:crosshair;flex:1;';
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);

      const COLS = ['#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080','#808040','#004040','#0080ff','#004080','#4000ff','#804000',
                    '#ffffff','#c0c0c0','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff','#ffff80','#faffb5','#80fffa','#b5faff','#b580ff','#ff8040'];
      let fg = '#000000', tool = 'pencil', size = 2, drawing = false, sx = 0, sy = 0, undoStack = [];

      const tools = el('div');
      tools.style.cssText = 'width:56px;display:grid;grid-template-columns:1fr 1fr;gap:2px;align-content:start;padding:3px;';
      const TOOL_DEFS = [['pencil','✏️','Pencil'],['brush','🖌️','Brush'],['eraser','◻','Eraser'],['fill','🪣','Fill'],['line','╱','Line'],['rect','▭','Rectangle']];
      TOOL_DEFS.forEach(([id, g, t]) => {
        const b = el('button'); b.textContent = g; b.title = t;
        b.style.cssText = 'width:25px;height:23px;font-size:12px;border:1px solid #808080;background:#ECE9D8;cursor:pointer;';
        b.addEventListener('click', () => { tool = id; paintToolButtons(); });
        tools.append(b); b._id = id;
      });
      function paintToolButtons() {
        [...tools.children].forEach(b => { b.style.background = b._id === tool ? '#b8c8e0' : '#ECE9D8'; b.style.borderColor = b._id === tool ? '#4060a0' : '#808080'; });
      }
      paintToolButtons();

      const palette = el('div');
      palette.style.cssText = 'width:56px;padding:3px;display:flex;flex-direction:column;align-items:center;gap:4px;';
      const preview = el('div');
      preview.style.cssText = 'position:relative;width:30px;height:30px;';
      const bgPrev = el('div'), fgPrev = el('div');
      bgPrev.style.cssText = 'position:absolute;right:0;bottom:0;width:18px;height:18px;border:1px solid #555;background:#fff;';
      fgPrev.style.cssText = 'position:absolute;left:0;top:0;width:18px;height:18px;border:1px solid #555;background:#000;z-index:1;';
      preview.append(bgPrev, fgPrev);
      const pgrid = el('div'); pgrid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:1px;';
      COLS.forEach(c => {
        const s = el('div');
        s.style.cssText = 'width:11px;height:11px;border:1px solid #808080;background:' + c + ';cursor:pointer;';
        s.addEventListener('mousedown', e => { e.preventDefault(); if (e.button === 2) { bgPrev.style.background = c; } else { fg = c; fgPrev.style.background = c; } });
        pgrid.append(s);
      });
      palette.append(preview, pgrid);

      body.append(tools, canvas, palette);
      const win = WM.openWindow({ title: 'untitled - Paint', icon: ICON.paint, app: 'paint', width: 640, height: 480, body,
        menubar: [
          { label: '<u>F</u>ile', items: () => [
            { label: 'New', action: () => { pushUndo(); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); } },
            { label: 'Save', action: () => { const a = el('a'); a.href = canvas.toDataURL('image/png'); a.download = 'untitled.png'; a.click(); WM.msg('Paint', 'Painted a picture. It was exported as untitled.png.', { type: 'info' }); } }
          ]},
          { label: '<u>E</u>dit', items: () => [
            { label: 'Undo', action: popUndo },
            '-',
            { label: 'Clear Image', action: () => { pushUndo(); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); } }
          ]},
          { label: '<u>I</u>mage', items: () => [
            { label: 'Invert Colors', action: () => { pushUndo(); const d = ctx.getImageData(0, 0, W, H); for (let i = 0; i < d.data.length; i += 4) { d.data[i] = 255 - d.data[i]; d.data[i+1] = 255 - d.data[i+1]; d.data[i+2] = 255 - d.data[i+2]; } ctx.putImageData(d, 0, 0); } }
          ]},
          { label: '<u>H</u>elp', items: () => [{ label: 'About Paint', action: () => WM.msg('About Paint', 'Microsoft (R) Paint\nVersion 5.1', { type: 'info' }) }] }
        ]
      });

      function pos(e) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) }; }
      function pushUndo() { if (undoStack.length > 18) undoStack.shift(); undoStack.push(ctx.getImageData(0, 0, W, H)); }
      function popUndo() { const u = undoStack.pop(); if (u) ctx.putImageData(u, 0, 0); }
      function stroke(color, lw) {
        ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      }
      function floodFill(x, y, hex) {
        const img = ctx.getImageData(0, 0, W, H), d = img.data;
        const idx = (y * W + x) * 4;
        const t = [d[idx], d[idx+1], d[idx+2], d[idx+3]];
        const rgb = [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16), 255];
        if (t[0]===rgb[0]&&t[1]===rgb[1]&&t[2]===rgb[2]) return;
        const st = [[x, y]];
        while (st.length) {
          const [cx, cy] = st.pop();
          if (cx < 0 || cy < 0 || cx >= W || cy >= H) continue;
          const i = (cy * W + cx) * 4;
          if (d[i]!==t[0]||d[i+1]!==t[1]||d[i+2]!==t[2]||d[i+3]!==t[3]) continue;
          d[i]=rgb[0];d[i+1]=rgb[1];d[i+2]=rgb[2];d[i+3]=255;
          st.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);
        }
        ctx.putImageData(img, 0, 0);
      }
      let snapshot = null;
      canvas.addEventListener('contextmenu', e => e.preventDefault());
      canvas.addEventListener('mousedown', e => {
        e.preventDefault(); pushUndo();
        const p = pos(e), color = (e.button === 2) ? bgPrev.style.background : fg;
        if (tool === 'fill') { floodFill(Math.round(p.x), Math.round(p.y), color); return; }
        drawing = true; sx = p.x; sy = p.y;
        snapshot = ctx.getImageData(0, 0, W, H);
        if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
          stroke(tool === 'eraser' ? '#ffffff' : color, tool === 'brush' ? size * 3 : size);
          ctx.beginPath(); ctx.moveTo(p.x, p.y);
        }
      });
      canvas.addEventListener('mousemove', e => {
        if (!drawing) return;
        const p = pos(e);
        if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') { ctx.lineTo(p.x, p.y); ctx.stroke(); }
        else if (tool === 'line' || tool === 'rect') {
          ctx.putImageData(snapshot, 0, 0);
          stroke(fg === '#000000' ? fg : fg, size);
          ctx.beginPath();
          if (tool === 'line') { ctx.moveTo(sx, sy); ctx.lineTo(p.x, p.y); }
          else ctx.rect(sx, sy, p.x - sx, p.y - sy);
          ctx.stroke();
        }
      });
      window.addEventListener('mouseup', () => { drawing = false; });
      setTimeout(() => canvas.focus(), 50);
      return win;
    }
  };

  /* ================================================================
     MINESWEEPER (authentic sprites)
  ================================================================ */
  APPS.mines = {
    launch(level) {
      const DIFF = { beginner: [9, 9, 10], intermediate: [16, 16, 40], expert: [30, 16, 99] };
      let [cols, rows, mines] = DIFF[level || 'beginner'];
      const win = WM.openWindow({ title: 'Minesweeper', icon: ICON.mines, app: 'mines', resizable: false, minimizable: true, maximizable: false, width: 46 + cols * 16, height: 132 + rows * 16,
        menubar: [
          { label: '<u>G</u>ame', items: () => [
            { label: 'New', accel: 'F2', action: () => reset() },
            '-',
            { label: 'Beginner', action: () => { win.close(); APPS.mines.launch('beginner'); } },
            { label: 'Intermediate', action: () => { win.close(); APPS.mines.launch('intermediate'); } },
            { label: 'Expert', action: () => { win.close(); APPS.mines.launch('expert'); } },
            '-',
            { label: 'Exit', action: () => win.close() }
          ]},
          { label: '<u>H</u>elp', items: () => [{ label: 'About Minesweeper', action: () => WM.msg('About Minesweeper', 'Can you clear the minefield?\nRight-click to flag. First click is always safe!', { type: 'info' }) }] }
        ],
        body: (() => { const b = el('div'); b.style.cssText = 'background:#c0c0c0;display:flex;flex-direction:column;align-items:center;'; return b; })()
      });

      let grid, cells, timerId = null, time = 0, flags = 0, state = 'idle', firstClick = true;
      const smileEl = el('img'); smileEl.style.cssText = 'width:26px;height:26px;cursor:pointer;border:2px outset #dfdfdf;';
      smileEl.src = MSW.smile;
      const pad = el('div');
      pad.style.cssText = 'background:#c0c0c0;border:3px outset #dfdfdf;padding:6px;margin:6px;display:flex;flex-direction:column;align-items:center;';
      const head = el('div');
      head.style.cssText = 'display:flex;justify-content:space-between;align-items:center;width:' + (cols * 16) + 'px;border:3px inset #808080;background:#c0c0c0;padding:3px 4px;margin-bottom:6px;';
      const ledMines = el('div'), ledTime = el('div');
      ledMines.style.cssText = ledTime.style.cssText = 'display:flex;gap:1px;background:#000;padding:1px;';
      function led(show, digits) {
        show.innerHTML = '';
        const s = String(Math.max(-99, Math.min(999, digits))).padStart(3, '0').replace('-??', '-??');
        s.split('').forEach(d => { const im = el('img'); im.style.cssText = 'width:13px;height:23px;'; im.src = /[0-9]/.test(d) ? MSW.d(d) : MSW.d(0); show.append(im); });
      }
      head.append(ledMines, smileEl, ledTime);
      const board = el('div');
      board.style.cssText = 'display:grid;grid-template-columns:repeat(' + cols + ',16px);border:3px inset #808080;';
      pad.append(head, board);
      win.body.append(pad);
      win.body.style.background = '#c0c0c0';

      function cellEl(i) { return cells[i]; }
      function reset() {
        grid = Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_, x) => ({ mine: false, adj: 0, open: false, flag: 0, i: y * cols + x })));
        cells = []; state = 'idle'; firstClick = true; time = 0; flags = 0;
        clearInterval(timerId); timerId = null;
        led(ledMines, mines); led(ledTime, 0);
        smileEl.src = MSW.smile;
        board.innerHTML = '';
        grid.flat().forEach(c => {
          const b = el('div');
          b.style.cssText = 'width:16px;height:16px;background:#c0c0c0;border:2px outset #fff;display:flex;align-items:center;justify-content:center;';
          b.addEventListener('click', () => dig(c));
          b.addEventListener('contextmenu', e => { e.preventDefault(); flag(c); });
          board.append(b); cells.push(b);
        });
      }
      function placeMines(safe) {
        let placed = 0;
        while (placed < mines) {
          const r = Math.floor(Math.random() * cols), q = Math.floor(Math.random() * rows);
          const c = grid[q][r];
          if (c.mine || (Math.abs(r - safe.x) <= 1 && Math.abs(q - safe.y) <= 1)) continue;
          c.mine = true; placed++;
        }
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
          let n = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const q = y + dy, r = x + dx;
            if (q >= 0 && q < rows && r >= 0 && r < cols && grid[q][r].mine) n++;
          }
          grid[y][x].adj = n;
        }
      }
      function renderCell(c) {
        const b = cellEl(c.i);
        if (c.flag === 1) { b.innerHTML = ''; b.append(el('img')); b.firstChild.src = MSW.flag; b.style.border = '2px outset #fff'; return; }
        if (c.flag === 2) { b.innerHTML = '<img style="width:10px" src="' + MSW.question + '">'; return; }
        if (!c.open) { b.style.cssText = 'width:16px;height:16px;background:#c0c0c0;border:2px outset #fff;'; b.innerHTML = ''; return; }
        b.style.cssText = 'width:16px;height:16px;background:#c0c0c0;border:1px solid #808080;border-width:' + (c.adj ? '1px 0 0 1px' : '1px 0 0 1px') + ';';
        if (c.mine) { b.innerHTML = ''; b.append(el('img')); b.firstChild.src = MSW.mine; return; }
        if (c.adj) { b.innerHTML = ''; const im = el('img'); im.src = MSW.open(c.adj); b.append(im); }
      }
      function open(c) {
        if (c.open || c.flag === 1) return;
        c.open = true;
        if (c.mine) return lose(c);
        renderCell(c);
        if (!c.adj) {
          const y = Math.floor(c.i / cols), x = c.i % cols;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const q = y + dy, r = x + dx;
            if (q >= 0 && q < rows && r >= 0 && r < cols) open(grid[q][r]);
          }
        }
        checkWin();
      }
      function dig(c) {
        if (state === 'over' || c.flag === 1) return;
        if (firstClick) { firstClick = false; placeMines({ x: c.i % cols, y: Math.floor(c.i / cols) }); smileEl.src = MSW.ohh; state = 'run'; timerId = setInterval(() => { time = Math.min(999, time + 1); led(ledTime, time); }, 1000); }
        else if (state !== 'run') return;
        smileEl.src = MSW.smile;
        if (c.open) { /* chord */ }
        else open(c);
      }
      function flag(c) {
        if (state === 'over' || c.open) return;
        c.flag = (c.flag + 1) % 3;
        flags += c.flag === 1 ? 1 : c.flag === 2 ? -1 : 0;
        flags = Math.max(0, flags);
        led(ledMines, mines - flags);
        renderCell(c);
        Sound.play('click');
      }
      function lose(hit) {
        state = 'over'; clearInterval(timerId);
        smileEl.src = MSW.dead;
        Sound.play('error');
        grid.flat().forEach(c => {
          const b = cellEl(c.i);
          if (c.mine && c.flag !== 1) { b.innerHTML = ''; const im = el('img'); im.src = c.i === hit.i ? MSW.mineDeath : MSW.mine; b.append(im); b.style.border = '1px solid #808080'; b.style.background = c.i === hit.i ? '#f00' : '#c0c0c0'; }
          else if (!c.mine && c.flag === 1) { b.innerHTML = ''; const im = el('img'); im.src = MSW.misflag; b.append(im); }
        });
      }
      function checkWin() {
        const left = grid.flat().filter(c => !c.open && !c.mine).length;
        if (!left) {
          state = 'over'; clearInterval(timerId);
          smileEl.src = MSW.win; Sound.play('tada');
          grid.flat().forEach(c => { if (c.mine && c.flag !== 1) { c.flag = 1; renderCell(c); } });
          WM.msg('You Won!', 'You cleared the minefield in ' + time + ' seconds. Great job!', { type: 'info' });
        }
      }
      smileEl.addEventListener('click', () => reset());
      win.el.addEventListener('keydown', e => { if (e.key === 'F2') reset(); });
      reset();
      return win;
    }
  };

  /* ================================================================
     COMMAND PROMPT
  ================================================================ */
  APPS.cmd = {
    launch() {
      const wrap = el('div');
      wrap.style.cssText = 'flex:1;background:#000;color:#c0c0c0;font-family:Lucida Console,Consolas,\'Courier New\',monospace;font-size:13px;padding:2px 4px;overflow-y:auto;cursor:text;-webkit-user-select:text;user-select:text;';
      const out = el('div');
      const line = el('div');
      line.style.cssText = 'display:flex;';
      const prompt = el('span'); prompt.style.whiteSpace = 'pre';
      const input = el('input');
      input.style.cssText = 'flex:1;background:transparent;border:none;outline:none;color:#c0c0c0;font:inherit;caret-color:#c0c0c0;';
      input.setAttribute('spellcheck', 'false');
      line.append(prompt, input);
      wrap.append(out, line);
      const PROMPT_TXT = 'C:\\Documents and Settings\\User> ';
      prompt.textContent = PROMPT_TXT;

      const win = WM.openWindow({ title: 'C:\\WINDOWS\\system32\\cmd.exe', icon: ICON.cmd, app: 'cmd', width: 640, height: 400, body: wrap });
      win.body.style.background = '#000';

      const history = []; let hIdx = -1;
      const print = t => { const d = el('div'); d.style.cssText = 'white-space:pre-wrap;word-break:break-all;'; d.textContent = t; out.append(d); wrap.scrollTop = wrap.scrollHeight; };
      print('Microsoft Windows XP [Version 5.1.2600]');
      print('(C) Copyright 1985-2001 Microsoft Corp.\n');

      const FS = {
        'C:': ['Documents and Settings', 'PROGRAM FILES', 'WINDOWS', 'AUTOEXEC.BAT', 'BOOT.INI', 'IO.SYS', 'MSDOS.SYS'],
        'C:\\documents and settings': ['All Users', 'Guest', 'LocalService', 'NETWORKSERVICE', 'User'],
        'C:\\documents and settings\\user': ['Application Data', 'Cookies', 'Desktop', 'Favorites', 'Local Settings', 'My Documents', 'NTUSER.DAT', 'Recent', 'Start Menu', 'Templates'],
        'C:\\documents and settings\\user\\my documents': ['My Music', 'My Pictures', 'resume.doc', 'homework final FINAL v3.doc', 'readme.txt'],
        'C:\\windows': ['system32', 'Fonts', 'Help', 'inf', 'installer', 'media', 'Temp', 'win.ini']
      };
      let cwd = 'C:\\documents and settings\\user';
      const promptFor = () => (cwd === 'C:\\documents and settings\\user' ? 'C:\\Documents and Settings\\User' : cwd).toUpperCase().replace(/:\\\\/, ':\\') + '> ';
      function setPrompt() { prompt.textContent = (cwd === 'C:\\documents and settings\\user' ? 'C:\\Documents and Settings\\User' : cwd.replace(/\\\\/g, '\\')).toUpperCase().replace(/([a-z]):/, (m, p) => p + ':') + '> '; }
      setPrompt();

      function handle(cmdline) {
        print((prompt.textContent).trim() + ' ' + cmdline);
        const m = cmdline.match(/^(\S+)\s*(.*)$/); if (!m) return;
        const cmd = m[1].toLowerCase(), arg = m[2].trim();
        const argL = arg.toLowerCase();
        switch (cmd) {
          case '': break;
          case 'help': print('FOR       CALL       TYPE       EXIT       SET       MORE\r\nVER       DATE       TIME       CD         MD        RD\r\nCLS       ECHO     SET       PAUSE      COPY      DIR\r\nPING      IPCONFIG TASKKILL   START      SHUTDOWN  COLOR\r\n\r\nTry: dir, cd, ping msn.com, start notepad, ver, winver, color 0a, shutdown -r'); break;
          case 'ver': print('\r\nMicrosoft Windows XP [Version 5.1.2600]\r\n'); break;
          case 'cls': out.innerHTML = ''; break;
          case 'echo': print(arg || 'ECHO is on.'); break;
          case 'date': print('The current date is: ' + new Date().toLocaleDateString()); break;
          case 'time': print('The current time is: ' + new Date().toLocaleTimeString()); break;
          case 'dir': {
            const key = arg ? cwd + '\\' + argL : cwd;
            const list = FS[key];
            if (!list) { print('File Not Found.'); break; }
            print(' Volume in drive C is Windows XP\r\n Volume Serial Number is 6F2B-4A19\r\n\r\n Directory of ' + key.replace(/\\\\/g,'\\').toUpperCase());
            let dirs = 0, files = 0, bytes = 0;
            list.forEach(n => {
              const isDir = !/\./.test(n); if (isDir) dirs++; else { files++; bytes += 1024 + (n.length * 317) % 65536; }
              print('05/20/2003  03:4' + (n.length % 10) + 'PM    ' + (isDir ? '<DIR>          ' : String((1024 + (n.length * 317) % 65536)).padStart(13) + '  ') + n);
            });
            print('             ' + files + ' File(s)      ' + bytes.toLocaleString() + ' bytes\r\n             ' + dirs + ' Dir(s)   3,412,905,984 bytes free');
            break;
          }
          case 'cd': case 'chdir': {
            if (!arg) { print((cwd).replace(/\\\\/g,'\\')); break; }
            let target;
            if (arg === '..') { const parts = cwd.split('\\'); parts.pop(); target = parts.join('\\') || 'C:'; }
            else if (arg === '\\') target = 'C:';
            else target = cwd + '\\' + argL;
            if (FS[target]) { cwd = target; setPrompt(); }
            else print('The system cannot find the path specified.');
            break;
          }
          case 'tree': { print('Folder PATH listing for volume Windows XP'); print('C:\\DOCUMENTS AND SETTINGS\\USER'); const kids = FS[cwd] || []; kids.forEach((k, i, arr) => print((i === arr.length - 1 ? '└───' : '├───') + k)); break; }
          case 'ping': {
            if (!arg) { print('usage: ping [-t] destination'); break; }
            print('\nPinging ' + arg + ' [' + (arg.includes('msn') ? '64.4.29.13' : arg.includes('google') ? '64.233.161.104' : '216.109.109.150') + '] with 32 bytes of data:\r\n');
            let n = 0;
            const tick = () => {
              if (n++ === 4) { print('\nPing statistics for ' + arg + ':\r\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),\r\nApproximate round trip times in milli-seconds:\r\n    Minimum = 18ms, Maximum = 51ms, Average = 31ms'); resolveDone(); return; }
              print('Reply from ' + (arg.includes('msn') ? '64.4.29.13' : '64.233.161.104') + ': bytes=32 time=' + (18 + Math.floor(Math.random() * 34)) + 'ms TTL=118');
              setTimeout(tick, 420);
            };
            const oldIn = input; tick(); break;
          }
          case 'ipconfig': print('\r\nWindows IP Configuration\r\n\r\nEthernet adapter Local Area Connection:\r\n\r\n   Connection-specific DNS Suffix  . : home.net\r\n   IP Address. . . . . . . . . . . . . : 192.168.1.23\r\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\r\n   Default Gateway . . . . . . . . . : 192.168.1.1\r\n'); break;
          case 'start': {
            if (/^(https?:\/\/|www\.)/i.test(argL)) { WM.openWeb(arg); break; }
            const app = argL.replace(/\.exe$/, '');
            if (['notepad','mspaint','calc','winmine','iexplore','wmplayer','explorer','firefox','ff','winamp','teamspeak','ts2'].includes(app)) WM.run(arg);
            else print('Windows cannot find \'' + arg + '\'.');
            break;
          }
          case 'winver': APPS.winver.launch(); break;
          case 'taskkill': {
            if (/explorer/.test(arg)) { print('ERROR: The process "explorer.exe" could not be terminated. Access is denied.'); break; }
            if (/msnmsgr/.test(arg) && APPS.msn && APPS.msn.isOnline && APPS.msn.isOnline()) { print('SUCCESS: The process "msnmsgr.exe" with PID 1337 has been terminated.'); APPS.msn.signOff && APPS.msn.signOff(); break; }
            print(/PID/.test(arg) ? 'ERROR: The process not found.' : 'ERROR: Invalid syntax. Type TASKKILL /PID <n> or /IM <image>.'); break;
          }
          case 'shutdown': {
            if (/-r/.test(argL)) { print('Shutting down in 5 seconds... (press ENTER to abort)'); setTimeout(() => Boot.shutdownFlow(true), 5000); break; }
            if (/-s/.test(argL)) { print('Shutting down...'); setTimeout(() => Boot.shutdownFlow(false), 2500); break; }
            if (/-a/.test(argL)) { print('Aborted shutdown.'); break; }
            print('usage: shutdown [-f] -s | -r | -a'); break;
          }
          case 'color': { wrap.style.color = /0a/.test(argL) ? '#0f0' : '#c0c0c0'; break; }
          case 'exit': win.close(); break;
          case 'format': { print('Process terminated because you did not confirm. (nice try)'); break; }
          case 'dir': break;
          default: print('\'' + m[1] + '\' is not recognized as an internal or external command,\r\noperable program or batch file.\r\n\r\nType HELP for a list of commands.');
        }
      }
      function resolveDone() { /* noop */ }
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') { const v = input.value; input.value = ''; if (v !== '') { history.unshift(v); hIdx = -1; } handle(v); wrap.scrollTop = wrap.scrollHeight; }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (history.length) { hIdx = Math.min(hIdx + 1, history.length - 1); input.value = history[hIdx]; } }
        else if (e.key === 'ArrowDown') { e.preventDefault(); hIdx = Math.max(hIdx - 1, -1); input.value = hIdx === -1 ? '' : history[hIdx]; }
      });
      wrap.addEventListener('click', () => input.focus());
      setTimeout(() => input.focus(), 60);
      return win;
    }
  };

  /* ================================================================
     INTERNET EXPLORER (fake 2003 web)
  ================================================================ */
  APPS.iexplore = {
    launch(startUrl) {
      const body = el('div');
      body.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#ECE9D8;';

      /* toolbar */
      const t1 = el('div', 'xp-toolbar');
      const mkB = (label, fn, icon) => { const b = el('button', 'tbr-btn'); if (icon) { const im = el('img'); im.src = icon; b.append(im); } else b.textContent = label; if (fn) b.addEventListener('click', fn); t1.append(b); return b; };
      const back = mkB('◀ Back'), fwd = mkB('Forward ▶'), stop = mkB('✕ Stop'), refr = mkB('↻ Refresh'), homeB = mkB('🏠 Home');
      t1.append(el('div', 'tbr-sep'));
      mkB('🔍 Search', () => go('http://www.google.com')); mkB('⭐ Favorites', () => WM.msg('Favorites', 'MSN.com\nMySpace - jess88\nGoogle\nYouTube (beta)\nWikipedia\nGeoCities - SiliconValley/8821\nHamsterDance.com (broken)', { type: 'info' })); mkB('🕓 History', () => WM.msg('History', todayHistory.join('\n') || 'You have no history.', { type: 'info' }));
      const t2 = el('div', 'xp-toolbar');
      t2.innerHTML = '<span style="color:#444;">Address</span>';
      const addr = el('div', 'tbr-combo'); addr.style.flex = '1';
      const addrIco = el('img'); addrIco.src = ICON.url; addrIco.style.cssText = 'width:16px;height:16px;';
      const addrIn = el('input'); addrIn.style.cssText = 'border:none;outline:none;flex:1;font:inherit;';
      addr.append(addrIco, addrIn);
      const goB = el('button', 'tbr-btn'); goB.innerHTML = 'Go'; t2.append(addr, goB);
      const status = el('div', 'xp-status'); status.textContent = 'Done';
      const pageWrap = el('div'); pageWrap.style.cssText = 'flex:1;background:#fff;overflow:auto;border-top:1px solid #aca899;';
      body.append(t1, t2, pageWrap, status);

      const todayHistory = [];
      const win = WM.openWindow({ title: 'MSN.com - Microsoft Internet Explorer', icon: ICON.ie, app: 'iexplore', width: 820, height: 600, cls: 'ie-win', body });
      win.body.style.background = '#ECE9D8';
      win.body.innerHTML = '';
      win.body.append(t1, t2, pageWrap, status);
      WM.setMenu(win, [
        { label: '<u>F</u>ile', items: () => [{ label: 'New Window', action: () => APPS.iexplore.launch() }, '-', { label: 'Close', action: () => win.close() }] },
        { label: '<u>E</u>dit', items: () => [{ label: 'Select All', action: () => document.execCommand('selectAll') }] },
        { label: '<u>V</u>iew', items: () => [{ label: 'Source', action: () => WM.msg('Notepad', 'Microsoft VBScript runtime error \'800a0409\'\nUnterminated string constant', { type: 'error' }) }] },
        { label: '<u>T</u>ools', items: () => [
          { label: 'Internet Options...', action: () => WM.msg('Internet Options', 'Internet Explorer cannot open the Internet site.\nInternet Explorer is busy.', { type: 'error' }) },
          { label: 'Manage Add-ons', action: () => WM.msg('Manage Add-ons', 'Enabled: MSN Messenger Presence Add-on\nDisabled: RealPlayer Plug-in', { type: 'info' }) }
        ]},
        { label: '<u>H</u>elp', items: () => [{ label: 'About Internet Explorer', action: () => WM.msg('About Internet Explorer', 'Microsoft (R) Internet Explorer\nVersion 6.0.2900.2180 (XP SP2)\nCryptography Strong', { type: 'info' }) }] }
      ]);

      const SITES = buildSites(u => go(u), () => addrIn.value, t => win.setTitle(t + ' - Microsoft Internet Explorer'));
      let hist = [], hIdx = -1;

      function norm(u) {
        u = (u || '').trim();
        if (!u) return 'http://www.msn.com';
        if (/^https?:\/\//i.test(u)) return u.toLowerCase();
        if (/^www\./i.test(u) || /\.[a-z]{2,}/i.test(u)) return 'http://' + u.toLowerCase();
        return 'http://www.google.com/search?q=' + encodeURIComponent(u);
      }
      function go(u, noHist) {
        u = norm(u);
        addrIn.value = u;
        status.textContent = 'Opening page ' + u + ' ...';
        win.setTitle('MSN.com - Microsoft Internet Explorer');
        pageWrap.innerHTML = '<div style="padding:40px;color:#555;font-family:Verdana;font-size:11px;">Loading...</div>';
        setTimeout(() => {
          const key = u.replace(/^http(s)?:\/\/(www\.)?/, '').replace(/\/$/, '') || 'msn.com';
          const site = SITES[key] || SITES[key + '/'] || SITES[u] || SITES[key.replace(/\?.*$/, '')];
          if (site) {
            render(site);
            if (!noHist) { hist = hist.slice(0, hIdx + 1); hist.push(u); hIdx = hist.length - 1; todayHistory.push(u); }
            status.textContent = 'Done';
            addrIco.src = ICON.url;
          } else if (/^javascript:/i.test(u)) { WM.msg('Internet Explorer', 'This message was displayed for your safety: Nice try.', { type: 'error' }); }
          else notFound(u);
        }, 320 + Math.random() * 480);
      }
      function render(site) {
        pageWrap.innerHTML = '';
        const pg = el('div');
        pg.className = 'ie-page';
        pg.innerHTML = site.html;
        pageWrap.append(pg);
        win.setTitle(site.title + ' - Microsoft Internet Explorer');
        pg.querySelectorAll('[data-go]').forEach(a => a.style.cursor = 'pointer');
        pg.addEventListener('click', e => { const t = e.target.closest('[data-go]'); if (t) { e.preventDefault(); go(t.getAttribute('data-go')); } });
        if (site.after) site.after(pg);
        pg.querySelectorAll('form').forEach(f => { if (f.hasAttribute('data-custom')) return; f.addEventListener('submit', e => {
          e.preventDefault();
          const q = f.querySelector('input').value;
          go('http://www.google.com/search?q=' + encodeURIComponent(q || 'windows xp'));
        }); });
      }
      function notFound(u) {
        pageWrap.innerHTML = `
          <div style="font-family:Verdana,Arial;padding:34px;color:#000;">
            <h2 style="font-size:19px;font-family:Verdana;margin-bottom:18px;">The page cannot be displayed</h2>
            <p style="margin-bottom:14px;">The page you are looking for is currently unavailable. The Web site might be<br>experiencing technical difficulties, or you may need to adjust your browser settings.</p>
            <hr style="border-top:1px solid #808080;margin:16px 0;">
            <p style="font-size:11px;"><b>Please try the following:</b></p>
            <ul style="font-size:11px;margin:8px 0 8px 30px;line-height:1.8;">
              <li>Click the <span data-go="reload" style="color:#00c;cursor:pointer;">Refresh</span> button, or try again later.</li>
              <li>If you typed the page address in the Address bar, make sure that it is spelled correctly.<br><span data-go="http://www.msn.com" style="color:#00c;cursor:pointer;">To check your connection settings, click the Tools menu, and then click Internet Options.</span></li>
              <li>Try to navigate to other pages on the Web site by using navigation bars, link pages, and site indexes.</li>
              <li><span data-go="http://www.google.com" style="color:#00c;cursor:pointer;">Click here to search Google for links to pages containing information about 'windows xp'</span>.</li>
            </ul>
            <p style="font-size:11px;margin-top:16px;">Cannot find server or DNS Error<br>${u}</p>
          </div>`;
        win.setTitle('Cannot find server - Microsoft Internet Explorer');
        status.textContent = 'Done';
        addrIco.src = ICON.critical;
        pageWrap.querySelectorAll('[data-go]').forEach(a => a.addEventListener('click', e => { const t = e.target.closest('[data-go]'); if (t.getAttribute('data-go') === 'reload') go(addrIn.value); else go(t.getAttribute('data-go')); }));
      }
      back.addEventListener('click', () => { if (hIdx > 0) { hIdx--; go(hist[hIdx], true); } });
      fwd.addEventListener('click', () => { if (hIdx < hist.length - 1) { hIdx++; go(hist[hIdx], true); } });
      refr.addEventListener('click', () => go(addrIn.value, true));
      homeB.addEventListener('click', () => go('http://www.msn.com'));
      stop.addEventListener('click', () => status.textContent = 'Done');
      goB.addEventListener('click', () => go(addrIn.value));
      addrIn.addEventListener('keydown', e => { if (e.key === 'Enter') go(addrIn.value); });

      go(startUrl && /^https?:|^www\.|^[a-z0-9.-]+\.[a-z]{2}/i.test(startUrl) ? startUrl : 'http://www.msn.com');
      return win;
    }
  };

  /* ================================================================
     SHARED FAKE-WEB REGISTRY — buildSites(nav, curUrl, setPageTitle)
     nav(url) navigates the calling browser window; curUrl() returns the
     address that is currently shown; setPageTitle(t) sets the document
     title. Used by Internet Explorer AND Firefox (APPS.buildSites).
  ================================================================ */
  function buildSites(nav, curUrl, setPageTitle) {
        const ava = AVA;
        const S = {};
        S['msn.com'] = { title: 'MSN.com: Hotmail, Messenger, News, Sports, Entertainment, ...', html: `
          <div style="font-family:Verdana,Arial,sans-serif;">
            <div style="background:#0a499f;color:#fff;display:flex;align-items:center;gap:14px;padding:8px 16px;font-family:Verdana;">
              <b style="font-size:22px;letter-spacing:-1px;">MSN<span style="color:#ffb400;">.com</span></b>
              <span style="font-size:11px;">by Microsoft&reg;</span>
              <span style="flex:1;"></span>
              <span style="font-size:11px;">Signed in as <b>User</b> &nbsp;|&nbsp; <span data-go="http://www.msn.com" style="text-decoration:underline;cursor:pointer;">Sign out</span></span>
            </div>
            <div style="display:flex;border-bottom:2px solid #ffb400;background:#e8eefb;">
              <div style="flex:1;padding:10px 16px;">
                <img src="${ICON.email}" style="width:32px;height:32px;vertical-align:middle;"><b style="font-size:14px;">Hotmail</b>
                <div style="font-size:11px;">You have <span style="background:#c00;color:#fff;padding:0 4px;border-radius:2px;">4 new messages!</span></div>
              </div>
              <div style="flex:1;padding:10px 16px;border-left:1px solid #c8d4ee;">
                <img src="${ICON.msn}" style="width:32px;height:32px;vertical-align:middle;"><b style="font-size:14px;">Messenger</b>
                <div style="font-size:11px;">Invite your friends to chat. <span data-go="msn://" style="color:#06c;text-decoration:underline;cursor:pointer;">Start Messenger</span></div>
              </div>
              <div style="flex:1;padding:10px 16px;border-left:1px solid #c8d4ee;">
                <img src="${ICON.catalog}" style="width:32px;height:32px;vertical-align:middle;"><b style="font-size:14px;">Windows Catalog</b>
                <div style="font-size:11px;">Get drivers &amp; apps for Windows XP.</div>
              </div>
            </div>
            <div style="display:flex;padding:14px 16px;gap:22px;">
              <div style="flex:2;font-size:12px;line-height:1.5;">
                <h3 style="color:#0a499f;font-size:15px;">Top Stories</h3>
                <ul style="margin:6px 0 0 18px;line-height:2;">
                  <li><b>Windows XP SP2 rolls out worldwide</b> — "security revolution" says Redmond</li>
                  <li><b>MySpace passes 10 million profiles</b> — teens can't stop top-8-ing</li>
                  <li><b>Doom 3 ships</b> — GPUs weep, gamers rejoice</li>
                  <li><b>Steam beta rolls out</b> — "just 12 minutes to install, relax" says Valve <span data-go="http://store.steampowered.com" style="color:#06c;">(huh?)</span></li>
                  <li>New on <b>YouTube (beta)</b>: <span data-go="http://www.youtube.com" style="color:#06c;cursor:pointer;">Evolution of Dance</span> — everyone is dancing</li>
                  <li><b>Nokia 3310 still alive</b>, survives pocket-dive into pool</li>
                  <li>Ringtone of the year: <i>Hamster Dance</i> (polyphonic) — <span data-go="http://www.geocities.com/Heartland/4211" style="color:#06c;cursor:pointer;">see original</span></li>
                </ul>
                <h3 style="color:#0a499f;font-size:15px;margin-top:18px;">Entertainment</h3>
                <ul style="margin:6px 0 0 18px;line-height:2;">
                  <li>Outkast wins everything. <span data-go="http://www.myspace.com" style="color:#06c;">Music news &raquo;</span></li>
                  <li>Finding Nemo is the #1 movie for the 4th week straight</li>
                  <li>New MSN Emoticons released: <span style="font-size:16px;">(y) (a) (b) (6)</span></li>
                </ul>
              </div>
              <div style="flex:1;min-width:200px;">
                <div style="border:1px solid #0a499f;padding:8px;background:#f2f6fd;font-size:11px;line-height:1.6;">
                  <b style="color:#0a499f;">Weather - Seattle, WA</b><br>
                  &#9728;&#65039; 71&deg;F Sunny &nbsp; H:75 L:58<br>
                  <span style="color:#777;">"Perfect nudge weather"</span>
                </div>
                <div style="border:2px solid #ffb400;margin-top:12px;padding:10px;background:#fffbe6;font-size:11px;text-align:center;">
                  <b>Ad: Have you met...</b><br>
                  <img src="${ava('skate')}" style="width:48px;height:48px;margin:6px;"><br>
                  ...someone sk8r boi on <b>MySpace</b>?<br>
                  <span data-go="http://www.myspace.com/jess88" style="color:#06c;text-decoration:underline;cursor:pointer;">Visit jess88's profile &raquo;</span>
                </div>
                <div style="margin-top:12px;font-size:10px;color:#777;">Get the authentic XP experience &rarr; <span data-go="http://www.google.com" style="color:#06c;">Google it</span></div>
              </div>
            </div>
            <div style="background:#0a499f;color:#9db9e8;font-size:10px;padding:8px 16px;">&copy; 2003 Microsoft. All rights reserved. | Terms of Use | Privacy</div>
          </div>` };
        S['google.com'] = { title: 'Google', html: `
          <div style="font-family:Arial,sans-serif;text-align:center;padding-top:60px;">
            <div style="font-size:58px;font-weight:bold;font-family:'Times New Roman',serif;">
              <span style="color:#4285f4;">G</span><span style="color:#ea4335;">o</span><span style="color:#fbbc05;">o</span><span style="color:#4285f4;">g</span><span style="color:#34a853;">l</span><span style="color:#ea4335;">e</span><span style="font-size:14px;color:#666;vertical-align:super;">beta</span>
            </div>
            <form style="margin-top:14px;"><input style="width:330px;height:20px;border:1px solid #7f9db9;font-size:13px;padding:1px 4px;" name="q"><br>
              <button type="submit" style="margin-top:10px;font-size:12px;padding:2px 10px;">Google Search</button>
              <button type="button" onclick="document.querySelector('[data-go=\\'http://www.msn.com\\']').click()" style="font-size:12px;padding:2px 10px;">I'm Feeling Lucky</button>
            </form>
            <div style="margin-top:40px;color:#666;font-size:11px;">Searching 3,083,324,652 web pages</div>
          </div>` };
        S['google.com/search'] = { title: 'Google: windows xp', html: `
          <div style="font-family:Arial;font-size:12px;">
            <div style="border-bottom:1px solid #7090ab;padding:8px 12px;">
              <span style="font-size:24px;font-weight:bold;color:#4285f4;font-family:'Times New Roman';">Google</span>
              <form style="display:inline;margin-left:12px;"><input name="q" value="windows xp" style="width:260px;"><button type="submit">Google Search</button></form>
            </div>
            <div style="padding:12px 24px;line-height:1.4;">
              <div style="margin-bottom:18px;">
                <a data-go="http://www.msn.com" style="color:#00c;font-size:14px;text-decoration:underline;cursor:pointer;">Microsoft Windows XP - Home of the best desktop ever made</a>
                <div style="color:#008000;">www.msn.com/</div>
                <div>One billion users can't be wrong. Grass. Blue sky. Bliss.</div>
              </div>
              <div style="margin-bottom:18px;">
                <a data-go="http://www.myspace.com/jess88" style="color:#00c;font-size:14px;text-decoration:underline;cursor:pointer;">MySpace - jess88's Profile</a>
                <div style="color:#008000;">www.myspace.com/jess88</div>
                <div>"here for friends &amp; sk8r boys. NOT creeps!! &lt;3" — 14 y/o, usa, girl</div>
              </div>
              <div style="margin-bottom:18px;">
                <a data-go="http://www.youtube.com/watch?v=dance" style="color:#00c;font-size:14px;text-decoration:underline;cursor:pointer;">YouTube - Broadcast Yourself. - Evolution of Dance</a>
                <div style="color:#008000;">www.youtube.com/watch?v=dance</div>
                <div>my like, since 1958, 187 million views... watch the internet's favorite dancing man.</div>
              </div>
              <div style="margin-bottom:18px;">
                <a data-go="http://www.wikipedia.org/wiki/Windows_XP" style="color:#00c;font-size:14px;text-decoration:underline;cursor:pointer;">Wikipedia, the free encyclopedia - Windows XP</a>
                <div style="color:#008000;">www.wikipedia.org/wiki/Windows_XP</div>
                <div>Windows XP is a major release of Microsoft's Windows NT operating system. WikiWikiUse!</div>
              </div>
              <div style="margin-bottom:18px;">
                <a data-go="http://www.geocities.com" style="color:#0000ee;font-size:14px;text-decoration:underline;cursor:pointer;">GeoCities - Free Homepages, Free Email, Free Community</a>
                <div style="color:#008000;">www.geocities.com/</div>
                <div>38 million homepages in 40 neighborhoods. Find your neighbors. Bring snacks.</div>
              </div>
              <div style="margin-bottom:18px;">
                <a data-go="http://www.geocities.com/Heartland/4211" style="color:#00c;font-size:14px;text-decoration:underline;cursor:pointer;">The Hamster Dance</a>
                <div style="color:#008000;">www.hamsterdance.com/</div>
                <div>oh ai ai ai ai ai hamsterster oh no no no...</div>
              </div>
              <div style="margin-bottom:18px;">
                <a style="color:#00c;font-size:14px;text-decoration:underline;cursor:pointer;" data-go="http://msdn.microsoft.com">MSN Messenger 7 — Download (18 MB)</a>
                <div style="color:#008000;">messenger.msn.com</div>
                <div>Custom emoticons, nudges, and buddy lists await. You have messages.</div>
              </div>
              <div style="color:#777;">Results <b>1 - 7</b> of about <b>30,400,000</b>. (0.18 seconds)</div>
            </div>
          </div>` };
        S['myspace.com'] = { title: "MySpace.com - The Networking Socially Distancing Community", html: `
          <div style="font-family:Verdana;font-size:11px;">
            <div style="background:#003399;color:#fff;padding:6px 10px;font-size:12px;">MySpace.com <b style="color:#ff7b00;">|</b> The Social Networking Site &nbsp; <a data-go="http://www.myspace.com/jess88" style="color:#ffd07b;cursor:pointer;">jess88 is in your extended network</a></div>
            <h2 style="font-family:Verdana;color:#666;margin:20px;">Who would you like to meet today?</h2>
            <ul style="margin-left:30px;line-height:2;"><li><a data-go="http://www.myspace.com/jess88" style="color:#00c;cursor:pointer;">jess88</a> — girl, 14, usa</li><li>dave_gfg — guy, 16, usa</li><li>xX_DarkAngel_Xx — 17, Germany</li></ul>
          </div>` };
        S['myspace.com/jess88'] = { title: "jess88's Profile", html: `
          <div style="font-family:Verdana;font-size:11px;">
            <div style="background:#003399;color:#fff;padding:6px 10px;font-size:12px;">MySpace.com | Profile <span style="float:right;">Home | Browse | Search | Invite | Mail | <a data-go="http://www.msn.com" style="color:#ffd07b;cursor:pointer;">MSN</a></span></div>
            <div style="background:#6699ff;color:#fff;padding:3px 10px;font-size:10px;">jess88's Friend Space!!! &gt;~_^ &nbsp;&nbsp; ☆彡 &nbsp; *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*</div>
            <div style="display:flex;gap:16px;padding:14px 16px;">
              <div style="width:300px;">
                <img src="${ava('skate')}" style="width:260px;border:4px solid #69f;background:#ddd;">
                <div style="margin-top:10px;line-height:1.8;">
                  <b style="font-size:16px;color:#0066cc;">jess88</a> is in your extended network</b><br>
                  <span style="color:#666;">girl, 14<br>now playing: <b style="color:#000;">In The End - Linkin Park 🎵</b><br>
                  Town <b style="color:#000;">Portland, OREGON</b><br>Status <b style="color:#cc0000;">It's Summerrrr :)))</b></span>
                </div>
                <div style="margin-top:10px;font-size:16px;">
                  <span style="background:#003399;color:#fff;padding:2px 6px;">Add to Friends</span>
                  <span style="background:#6699ff;color:#fff;padding:2px 6px;">Send Message</span>
                  <span data-go="msn://" style="background:#0a8fd4;color:#fff;padding:2px 6px;cursor:pointer;">Instant Message</span>
                </div>
              </div>
              <div style="flex:1;max-width:420px;">
                <h3 style="font-family:Verdana;background:#6699ff;color:#fff;padding:2px 6px;font-size:12px;">Contacting jess88</h3>
                <div style="line-height:1.9;">&#128231; Send Message<br>&#128240; Blurbs<br>&#127911; Interests</div>
                <h3 style="font-family:Verdana;background:#6699ff;color:#fff;padding:2px 6px;font-size:12px;margin-top:12px;">jess88's Blurbs</h3>
                <div style="line-height:1.6;color:#333;">
                  <b style="color:#cc0066;">About me:</b><br>
                  omg hi!!! i luv summr, my space, my pets (mr. whiskers &amp; bubbles), drawin in mspaint, &amp; chating on msn messenger all nite XD. NO DRAMA.
                  if ur a creep i will block u and nudge u lol. &lt;3 jess<br><br>
                  <b style="color:#cc0066;">Who jess88 would like to meet:</b><br>
                  justin t, myspace tom (thx 4 the profile!!), and anybody who likes BLINK-182
                </div>
                <h3 style="font-family:Verdana;background:#6699ff;color:#fff;padding:2px 6px;font-size:12px;margin-top:12px;">jess88's Top 8</h3>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;font-size:10px;">
                  ${[['dave','dave_gfg'],['dog','xX_DarkAngel_Xx'],['beach','surfboy2001'],['flower','sarah_beth'],['rocket','space_guy'],['soccer','mikey-soccer'],['chess','brainiac'],['duck','quack.jpg']].map(([a, n]) =>
                    `<div><img src="${ava(a)}" style="width:64px;height:64px;border:2px solid #69f;"><br><span data-go="http://www.myspace.com" style="color:#00c;text-decoration:underline;cursor:pointer;">${n}</span></div>`).join('')}
                </div>
                <div style="margin-top:12px;border-top:1px dashed #69f;padding-top:8px;">
                  <b>12847 Comments!!! (omg leave me a comment!)</b>
                  <div style="background:#e5efff;padding:6px;margin-top:6px;">&lt;3 &lt;3 &lt;3 update ur profile!!! — xX_DarkAngel_Xx · Aug 2</div>
                  <div style="background:#e5efff;padding:6px;margin-top:4px;">add me back &lt;3 — mikey-soccer · Jul 30</div>
                  <div style="background:#e5efff;padding:6px;margin-top:4px;">ur song is sooo good lol — brainiac · Jul 28</div>
                </div>
              </div>
            </div>
            <div style="background:#003399;color:#9db9e8;font-size:10px;padding:6px 10px;">&copy;2003 MySpace.com. All Rights Reserved.</div>
          </div>` };
        /* ================= YouTube — 2005 beta ================= */
        const YT = [
          ['dance', 'Evolution of Dance', '0:45', '158,231,003', '\u{1F57A}', '#f2c14e'],
          ['numa', 'Numa Numa (Dragostea Din Tei)', '3:38', '44,201,512', '\u{1F3A4}', '#7ec8f7'],
          ['swkid', 'Star Wars Kid', '1:56', '26,908,414', '\u{1F3AC}', '#d09090'],
          ['unicorn', 'Charlie the Unicorn', '11:12', '9,104,882', '\u{1F984}', '#b07ed6'],
          ['hamster', 'Hamster Dance (official remix)', '1:27', '12,441,009', '\u{1F439}', '#e0a35c']
        ];
        const ytThumb = v => '<div class="yt-cell"><div class="yt-thumb" style="background:linear-gradient(135deg,' + v[5] + ' 0%,#3a3f4a 130%);" data-go="http://www.youtube.com/watch?v=' + v[0] + '"><span>' + v[4] + '</span><i>\u25B6</i><b>' + v[3] + '</b></div>' +
          '<div class="yt-vt" data-go="http://www.youtube.com/watch?v=' + v[0] + '">' + v[1] + '</div><div class="yt-vi">' + v[2] + ' \u2014 ' + v[3] + ' views</div></div>';
        const ytHead = '<div class="yt-bar"><span>' + '<span class="yt-logo">You<span class="tube">Tube</span><em>beta</em></span> <span class="yt-slogan">Broadcast Yourself\u2122</span></span>' +
          '<form data-custom class="yt-form"><input class="yt-input" placeholder="Search Videos..." maxlength="60"><button type="submit">Search</button></form></div>';
        const ytBindSearch = pg => { const f = pg.querySelector('form.yt-form'); if (f) f.addEventListener('submit', e => { e.preventDefault(); nav('http://www.youtube.com/results?search_tags=' + encodeURIComponent(f.querySelector('input').value || 'hamster dance')); }); };
        const ytFoot = '<div class="yt-foot">&copy;2005 YouTube&trade;, Inc. \u2014 videos are powered by Macromedia&reg; Flash&trade; Player 6. Don\'t have Flash? Enjoy the thumbnails. | About | Press | Terms</div>';
        S['youtube.com'] = { title: 'YouTube - Broadcast Yourself.', html: `
          <div class="yt-wrap">${ytHead}
            <div class="yt-main">
              <div class="yt-hint">Check out the latest featured and most viewed videos:</div>
              <div class="yt-grid">${YT.map(ytThumb).join('')}</div>
              <div class="yt-cols">
                <div class="yt-col"><h4>Most Discussed This Week</h4><ol><li>Evolution of Dance (41,203 comments)</li><li>Is the Numa Numa guy the new Britney? (8,112)</li><li>Star Wars Kid \u2014 should his school expel him?? (2,900)</li></ol></div>
                <div class="yt-col"><h4>Video of the Day</h4>${ytThumb(YT[4])}</div>
              </div>
            </div>${ytFoot}
          </div>`, after: pg => ytBindSearch(pg) };
        S['youtube.com/results'] = { title: 'YouTube: Search results', html: `
          <div class="yt-wrap">${ytHead}
            <div class="yt-main"><div class="yt-hint">Search results for &ldquo;<b id="yt-q">hamster dance</b>&rdquo; \u2014 about <b>37,800</b> videos (0.07 seconds)</div>
              <div class="yt-grid">${[YT[4], YT[0], YT[1]].map(ytThumb).join('')}</div>
              <div class="yt-hint" style="color:#777;">Did you mean: <span data-go="http://www.youtube.com" style="color:#06c;cursor:pointer;">hamster dance</span></div>
            </div>${ytFoot}
          </div>`, after: pg => {
            ytBindSearch(pg);
            const q = (curUrl().match(/search_tags=([^&]*)/) || [])[1];
            if (q) pg.querySelector('#yt-q').textContent = decodeURIComponent(q.replace(/\+/g, ' ')).toLowerCase();
          } };
        S['youtube.com/watch'] = { title: 'YouTube - Evolution of Dance', html: `
          <div class="yt-wrap">${ytHead}
            <div class="yt-main"><div class="yt-watch">
              <div class="yt-player"><div class="yt-screen">
                <div class="yt-buffer"><i></i></div>
                <div class="yt-note">Loading video...<br><small>Buffering: your 56k modem is doing its best.</small></div>
                <button class="yt-bigplay hidden" title="Play">\u25B6</button>
              </div></div>
              <div class="yt-info">
                <div><b id="yt-wt" style="font-size:15px;">Evolution of Dance</b> <span id="yt-wv" style="color:#666;">\u2014 158,231,003 views</span></div>
                <div class="yt-rate">Rate: <span style="color:#f0b400;">\u2605\u2605\u2605\u2605\u2605</span> 4.9 &nbsp;|&nbsp; Added on: <b>Apr 3, 2005</b> &nbsp;|&nbsp; Owned by: <span style="color:#06c;">jdancefan2005</span></div>
                <div class="yt-desc">The greatest dance medley of all time, from the Twist to the Running Man. Filmed in a garage. Be kind, no flaming.</div>
                <div class="yt-share"><span>\u{1F44D} 2,901,240</span><span>\u{1F44E} 3,108</span><span>\u2795 Add to Favorites</span><span>\u2709 Send to a Friend</span><span>\u{1F4DD} Flag</span></div>
                <div class="yt-emb"><b>Embed:</b> Copy and paste this code into your page or <span data-go="http://www.myspace.com" style="color:#06c;cursor:pointer;">MySpace</span> profile!
                  <textarea readonly rows="3">&lt;object width="425" height="350"&gt;&lt;param name="movie" value="http://www.youtube.com/v/dance"&gt;&lt;embed src="http://www.youtube.com/v/dance" type="application/x-shockwave-flash" width="425" height="350"&gt;&lt;/embed&gt;&lt;/object&gt;</textarea></div>
                <h4 style="margin:10px 0 4px;">More Videos:</h4>
                <div class="yt-grid small" id="yt-more"></div>
              </div>
            </div></div>${ytFoot}
          </div>`, after: pg => {
            ytBindSearch(pg);
            const id = ((curUrl().match(/[?&]v=([^&]*)/) || [])[1] || 'dance').toLowerCase();
            const v = YT.find(x => x[0] === id) || YT[0];
            pg.querySelector('#yt-wt').textContent = v[1];
            pg.querySelector('#yt-wv').textContent = '\u2014 ' + v[3] + ' views';
            setPageTitle('YouTube - ' + v[1]);
            const more = pg.querySelector('#yt-more');
            more.innerHTML = YT.filter(x => x[0] !== v[0]).slice(0, 4).map(ytThumb).join('');
            more.style.gridTemplateColumns = 'repeat(4,1fr)';
            const scr = pg.querySelector('.yt-screen'), buf = pg.querySelector('.yt-buffer'), big = pg.querySelector('.yt-bigplay');
            scr.querySelector('.yt-note').style.display = '';
            buf.style.display = ''; big.classList.add('hidden');
            setTimeout(() => { if (!pg.isConnected) return; buf.style.display = 'none'; scr.querySelector('.yt-note').style.display = 'none'; big.classList.remove('hidden'); }, 2600);
            big.onclick = () => {
              Sound.play('chord', { vol: .5 });
              scr.innerHTML = '<div class="yt-dancing">' + v[4] + '</div><div class="yt-note" style="opacity:.75;">Now playing \u2014 in your imagination.&nbsp; &nbsp;' + v[2] + '</div>';
            };
          } };

        /* ================= Wikipedia — 2001 style ================= */
        const wikiPage = (title, body) => `
          <div class="wiki-page">
            <div class="wiki-top"><span class="wiki-word">Wikipedia</span> <span class="wiki-tag">the free encyclopedia</span>
              <form data-custom class="wiki-form"><input placeholder="Search" size="18"><button>Go</button></form></div>
            <hr class="wiki-hr">
            <div class="wiki-nav">[ <span data-go="http://www.wikipedia.org" style="color:#0000cc;cursor:pointer;">Main Page</span> ] [ <span class="wiki-red">RecentChanges</span> ] [ <span class="wiki-red">RecentDiscussions</span> ] [ <span class="wiki-red">RandomPage</span> ]</div>
            ${body}
            <hr class="wiki-hr">
            <div class="wiki-foot">This page is served from a very small server in Florida. Wikipedia needs more servers \u2014 <span class="wiki-red">donate one</span>!<br>
            Powered by UseModWiki 0.92 \u00b2 \u00b7 This page has been accessed <b>23</b> times.</div>
          </div>`;
        const wikiBind = pg => { const f = pg.querySelector('form.wiki-form'); if (f) f.addEventListener('submit', e => { e.preventDefault(); const q = f.querySelector('input').value.toLowerCase();
          nav(/counter|strike|halflife/.test(q) ? 'http://www.wikipedia.org/wiki/Counter-Strike' : 'http://www.wikipedia.org/wiki/Windows_XP'); }); };
        S['wikipedia.org'] = { title: 'Wikipedia, the free encyclopedia', html: wikiPage('Main Page', `
          <h1 class="wiki-h1">Wikipedia</h1>
          <p>Welcome to <b>Wikipedia</b>, the free encyclopedia that <i>anyone</i> can edit. We currently have <b>19,734</b> articles in English.</p>
          <p>Wikipedia uses <b><span class="wiki-red">CamelCase</span></b> links: CapitalizeTheFirstLetterOfEachWordPlease. Note that currently both <span class="wiki-red">CamelCase</span> links and [[WikiWikiUse!]] style links work.</p>
          <h3 class="wiki-h1">Current projects</h3>
          <ul class="wiki-ul">
            <li><span data-go="http://www.wikipedia.org/wiki/Windows_XP" style="color:#0000cc;cursor:pointer;">WindowsXp</span> \u2014 the grass one.</li>
            <li><span data-go="http://www.wikipedia.org/wiki/Counter-Strike" style="color:#0000cc;cursor:pointer;">CounterStrike</span> \u2014 rush B.</li>
            <li><span class="wiki-red">Nostalgia</span> \u2014 (this article has not been created yet.)</li>
          </ul>
          <p style="color:#666;"><i>Please be bold! But maybe not on the Windows XP page, it is locked (I locked it, my name is Jimmy Wales).</i></p>`, `
          `), after: wikiBind };
        S['wikipedia.org/wiki/windows_xp'] = { title: 'Windows XP - Wikipedia, the free encyclopedia', html: wikiPage('Windows XP', `
          <h1 class="wiki-h1">Windows XP</h1>
          <p><b>Windows XP</b> (short for <i>experience</i>, but also sounds like <span class="wiki-red">hexadecimal</span> 0xP, which is not true) is an operating system produced by <span data-go="http://www.msn.com" style="color:#0000cc;cursor:pointer;">Microsoft</span>, released on October 25, 2001. It is the one with the grass.</p>
          <h3 class="wiki-h1">Table of contents</h3>
          <ol class="wiki-ul"><li>Overview</li><li>Features</li><li>Luna</li><li>Criticisms</li></ol>
          <h3 class="wiki-h1">1. Overview</h3>
          <p>Windows XP unifies the consumer (Windows Me, RIP) and business (Windows 2000) lines onto the NT kernel. The default skin is called <b>Luna</b> and features blue taskbars and green Start buttons. Many users spend their first hour changing it back to Windows Classic, and the second hour playing 3D Pinball, which has been removed for legal reasons.</p>
          <h3 class="wiki-h1">3. Luna</h3>
          <p>The wallpaper, known as <b>Bliss</b>, is a photograph of hills in Sonoma County, California, taken with a Mamiya RZ45. People often ask if it is Photoshopped. It is not. It is just too green to be real, like all our memories.</p>
          <h3 class="wiki-h1">4. Criticisms</h3>
          <p>See also: <span class="wiki-red">ActivationUnfriendliness</span>, <span wiki-red="">MessengerService</span>, <span class="wiki-red">ClippyUnrelated</span>.</p>
          <div class="wiki-box">This article is a stub. Can you expand it? Please do, I have been editing this page for 20 minutes.</div>
          <div class="wiki-meta">Last modified 14:21, 24 Oct 2001 (UTC) \u00b7 <span class="wiki-red">Create new page</span></div>`, `
          `), after: wikiBind };
        S['wikipedia.org/wiki/counter-strike'] = { title: 'Counter-Strike - Wikipedia, the free encyclopedia', html: wikiPage('Counter-Strike', `
          <h1 class="wiki-h1">Counter-Strike</h1>
          <p><b>Counter-Strike</b> is a multiplayer first-person shooter, originally a Half-Life mod by Minh "Gooseman" Le and Jess Cliffe. Version 1.5, considered by its players (a strong word) to be the peak of human civilization, shipped in 2002.</p>
          <h3 class="wiki-h1">Gameplay</h3>
          <p>Two teams, <b>Counter-Terrorists</b> and <b>Terrorists</b>, attempt to complete objectives on maps of varying levels of dust. The most famous map, <b>de_dust2</b>, consists primarily of a middle that both teams agree to stare at.</p>
          <h3 class="wiki-h1">Culture</h3>
          <p>Phrases popularized by the game include "rush B", "cover me", and "he's lit". Buying a defuser is controversial. AWM camping is a lifestyle.</p>
          <div class="wiki-box">This article is about the video game. For the actual thing, see <span class="wiki-red">PoliceAction</span> (not written yet).</div>
          <div class="wiki-meta">Last modified 03:12, 11 Jun 2004 (UTC) \u00b7 <span class="wiki-red">Create new page</span></div>`, `
          `), after: wikiBind };

        /* ================= GeoCities — 1999 forever ================= */
        const geoHead = '<div class="geo-head">\u{1F30E} <b>GEO</b>CITIES <span class="geo-sub">Build your own homepage! Free! Forever! (probably)</span></div>';
        const geoCnt = n => '<span class="geo-cnt">' + String(n).padStart(6, '0').split('').map(d => '<span>' + d + '</span>').join('') + '</span>';
        const geoRing = '<div class="geo-ring">[ <span data-go="http://www.geocities.com" style="cursor:pointer;">&laquo; Prev</span> ] &nbsp;&copy; The Awesome Homepages WebRing &nbsp; [ <span data-go="http://www.geocities.com" style="cursor:pointer;">Random</span> ] &nbsp; [ <span data-go="http://www.geocities.com" style="cursor:pointer;">Next &raquo;</span> ]</div>';
        S['geocities.com'] = { title: 'GeoCities - Your Life on the Web', html: `
          <div class="geo-page">${geoHead}
            <div class="geo-body">
              <div class="geo-marquee"><span>&#127381; Welcome to GeoCities \u2014 over 38 MILLION homepages in 40 neighborhoods! \u2022 Sign my guestbook!! \u2022 Best viewed with Netscape Navigator 4.0 at 800x600 \u2022 Don't forget to bookmark me!!! &#127381;</span></div>
              <p style="font-family:'Comic Sans MS',cursive;font-size:15px;text-align:center;">Choose your <b>neighborhood</b> and meet your neighbors:</p>
              <table class="geo-hoods" cellspacing="0">
                <tr><td>\u{1F4BB} <span data-go="http://www.geocities.com/SiliconValley/8821">SiliconValley/8821</span><br><small>Jamie's Kool Homepage</small></td>
                    <td>\u{1F47D} <span data-go="http://www.geocities.com/Area51/6776">Area51/6776</span><br><small>The Truth Page</small></td></tr>
                <tr><td>\u{1F439} <span data-go="http://www.geocities.com/Heartland/4211">Heartland/4211</span><br><small>The Hamster Dance</small></td>
                    <td>\u{1F3AC} <span>Hollywood/4478</span> <small>(walking there...)</small></td></tr>
                <tr><td>\u{2696}\uFE0F <span>CapitolHill/2210</span> <small>(out of cookies)</small></td>
                    <td>\u{1F5FC} <span>Tokyo/3357</span> <small>(dial-up congestion)</small></td></tr>
              </table>
              <p style="text-align:center;font-size:11px;">Not enough? Create your OWN homepage free! Only 4 MB. That's like... a whole barn.</p>
              ${geoRing}
            </div>
            <div class="geo-foot">&copy;1999 GeoCities. All neighborhood names are trademarks of their respective neighborhoods. Nobody.</div>
          </div>` };
        S['geocities.com/siliconvalley/8821'] = { title: "Jamie's Kool Homepage!!!!1 - SiliconValley - GeoCities", html: `
          <div class="geo-page dark">${geoHead}
            <div class="geo-body">
              <div class="geo-marquee light"><span>&#9733; Welcome 2 my homepage!!! &#9733; U R visitor number 004812 &#9733; Plz sign my guestbook b4 u leave or else &#9733; NEW: I learned HTML in shop class &#9733;</span></div>
              <div style="text-align:center;">
                <div class="geo-uc blink">\u{1F6A7} UNDER CONSTRUCTION \u{1F6A7}</div>
                <hr class="geo-hr">
                <h1 class="geo-title">~*~ Jamies Kool Homepage ~*~</h1>
                <div class="geo-tag">home of: computers, the X-Files, hamsters &amp; legit warez (kidding... unless)</div>
                <hr class="geo-hr">
                <div class="geo-cnt-wrap">You are visitor number ${geoCnt(4812)} since Aug 1999</div>
                <table width="100%" style="font-size:12px;"><tr>
                  <td width="45%" valign="top"><div class="geo-side"><b>&#128190; STUFF 2 SEE</b>
                    <ul class="geo-ul">
                      <li><span data-go="http://www.geocities.com/Area51/6776">My X-Files page \u2014 THE TRUTH</span></li>
                      <li><span data-go="http://www.geocities.com/Heartland/4211">The HAMSTER DANCE \u2014 do not miss</span></li>
                      <li><span class="geo-gb">Sign my Guestbook!!</span></li>
                      <li><span class="geo-midi">\u25B6 Play theme song (MIDI, 3 KB)</span></li>
                      <li><span data-go="mailto:jammed_up@hotmail.com">E-mail me! (animated)</span></li>
                    </ul></div></td>
                  <td valign="top"><div class="geo-side"><b>&#128203; ABOUT ME</b>
                    <p>name: jamie<br>age: 14 &frac12; (basically 15)<br>loc: SiliconValley, obviously<br>fav band: Linkin Park<br>fav color: #00FF00<br>fav OS: Windows 98 SE (XP is for spooks)</p>
                    <p style="font-size:10px;color:#9f9;">"Those who can make you believe absurdities can make you commit atrocities." \u2014 Voltaire (probably)</p></div></td>
                </tr></table>
                <div class="geo-badges"><span class="geo-badge">NETSCAPE NOW!</span><span class="geo-badge">800x600</span><span class="geo-badge">Made with NOTEPAD</span><span class="geo-badge anti-spam">ANTI-SPAM</span></div>
                ${geoRing}
              </div>
            </div>
          </div>`, after: pg => {
            pg.querySelector('.geo-gb').addEventListener('click', () => WM.msg('Guestbook', 'The guestbook is FULL (48 entries).\n\nMost recent entry, by xX_shadow_wolf_Xx:\n"sub7 me back pls, and put me in ur top section"\n\nDelete an entry to sign it? [Not allowed]', { type: 'info' }));
            pg.querySelector('.geo-midi').addEventListener('click', () => { Sound.play('chimes', { vol: .6 }); WM.msg('Media Player', 'Now playing: final Countdown (midi).html\n\nThe melody is coming to you at a crisp 22050 Hz through your PC speaker. You are welcome.', { type: 'info' }); });
            pg.querySelector('.anti-spam').addEventListener('click', () => WM.msg('Anti-Spam', 'This page asserts its right to be free of spam, junk mail, and unsolicited emails.\n\nIt has been 0 days since the last spam.', { type: 'info' }));
          } };
        S['geocities.com/area51/6776'] = { title: "THE TRUTH IS OUT THERE - Area51 - GeoCities", html: `
          <div class="geo-page alien">${geoHead}
            <div class="geo-body">
              <h1 class="geo-title alien">THE TRUTH IS OUT THERE</h1>
              <div class="geo-alien">.\u2022\u00b0.\u00b7 \u00b7\u00b0\u2022\u00b7.\u00b0 \u00b7\u00b0\u2022\u00b7.\u00b0 \u{1F6F8} \u00b0\u2022\u00b7.\u00b0 \u00b7\u00b0\u2022\u00b7.\u00b0 \u00b7\u2022\u00b0.</div>
              <div class="geo-ufo">
                <b>&#9888; EVIDENCE &#9888;</b>
                <ul class="geo-ul">
                  <li>Area 51: flights every night at 3am. I have a flashlight &amp; binoculars.</li>
                  <li>Microwave ovens &ne; popcorn. They are <b>beacon jammers</b>.</li>
                  <li>My cat stared at the sky for 6 hours on Aug 3, 1999.</li>
                  <li>They put subliminal messages in the dial-up handshake. Listen again. LISTEN.</li>
                </ul>
              </div>
              <div class="geo-alien blink">* * * THEY ARE READING THIS PAGE RIGHT NOW * * *</div>
              <p style="text-align:center;"><span data-go="http://www.geocities.com/SiliconValley/8821" style="color:#4af;">&laquo; back to Jamie's page (before they take it down)</span></p>
              ${geoRing}
            </div>
          </div>` };
        S['geocities.com/heartland/4211'] = { title: 'The HAMSTER DANCE!!! - Heartland - GeoCities', html: `
          <div class="geo-page hammy">${geoHead}
            <div class="geo-body">
              <h1 class="geo-title hammy">The HAMSTER DANCE!!</h1>
              <div class="hamster">
                ${Array.from({ length: 24 }, () => '<span>\u{1F439}</span>').join('')}
              </div>
              <div class="geo-lyrics">Oh ecs eh, ecs eh, ah ah, wu!<br>Oh ecs eh, ecs eh, ah ah, wu!<br>Oh ecs eh, ecs eh, ah ah, wu!<br>Oh whew!</div>
              <div style="text-align:center;margin:10px 0;"><button class="geo-party">\u{1F3B5} PARTY MODE \u{1F3B5}</button></div>
              <div class="geo-hint">This hamster was originally recorded at 1:47am over a sped-up sample of "Whistleumping"? No. It is legally "Whistle Dance". The hamsters demand respect.</div>
              <div style="text-align:center;font-size:12px;margin:8px 0;">Now also on: <span data-go="http://www.youtube.com/watch?v=hamster" style="color:#06c;cursor:pointer;text-decoration:underline;">YouTube (beta)</span></div>
              ${geoRing}
            </div>
          </div>`, after: pg => {
            let party = false;
            pg.querySelector('.geo-party').addEventListener('click', e => {
              party = !party; pg.querySelector('.hamster').classList.toggle('party', party);
              e.target.textContent = party ? '\u23F8 Stop the party' : '\u{1F3B5} PARTY MODE \u{1F3B5}';
              if (party) Sound.play('chord', { vol: .55 });
            });
          } };
    return S;
  }
  APPS.buildSites = buildSites;

  /* ================================================================
     WINDOWS MEDIA PLAYER
  ================================================================ */
  const WMP_TRACKS = [
    { t: 'In The End', a: 'Linkin Park', len: 216 },
    { t: 'Lose Yourself', a: 'Eminem', len: 326 },
    { t: 'Hey Ya!', a: 'OutKast', len: 233 },
    { t: 'Where Is the Love?', a: 'Black Eyed Peas', len: 289 },
    { t: 'With Me', a: 'Sum 41', len: 175 },
    { t: 'Move Bitch', a: 'Ludacris', len: 271 },
    { t: 'Only Time', a: 'Enya', len: 218 },
    { t: 'Drown You Out', a: 'EVALS', len: 204 }
  ];
  APPS.wmp = {
    launch(file) {
      const body = el('div');
      body.style.cssText = 'height:100%;display:flex;flex-direction:column;background:#1d2f5a;color:#cfd8ee;font-family:Tahoma;';
      body.innerHTML = `
        <div style="background:linear-gradient(180deg,#33518f,#1d2f5a);padding:6px 10px;font-size:11px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #0a1633;">
          <img src="${ICON.wmp9}" style="width:18px;height:18px;"><b>Windows Media Player</b><span style="opacity:.7;">Now Playing</span>
        </div>
        <div style="flex:1;display:flex;min-height:0;">
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:radial-gradient(circle at 50% 30%, #2b4680, #101a36);">
            <div style="width:300px;height:120px;display:flex;align-items:center;justify-content:center;background:#000;">
              <canvas id="wmp-viz" width="300" height="120" style="width:300px;height:120px;"></canvas>
              <video id="wmp-video" playsinline style="display:none;width:100%;height:100%;object-fit:contain;background:#000;"></video>
            </div>
            <div id="wmp-title" style="font-size:13px;color:#fff;text-align:center;">Select a song to play</div>
            <div style="width:90%;height:8px;border:1px solid #6f89b8;background:#0a142b;position:relative;cursor:pointer;" id="wmp-seek"><div id="wmp-prog" style="height:100%;width:0%;background:linear-gradient(90deg,#3ba3e6,#8fd0ff);"></div></div>
            <div style="display:flex;gap:10px;font-size:10px;justify-content:space-between;width:90%;color:#9fb4dc;">
              <span id="wmp-t0">0:00</span><span id="wmp-rate">128kbps</span><span id="wmp-t1">0:00</span>
            </div>
            <div style="display:flex;gap:12px;align-items:center;margin-top:4px;" id="wmp-transport">
              <button class="wmp-b" data-act="prev">&#9198;</button>
              <button class="wmp-b" data-act="play">&#9654;</button>
              <button class="wmp-b" data-act="pause">&#10074;&#10074;</button>
              <button class="wmp-b" data-act="stop">&#9632;</button>
              <button class="wmp-b" data-act="next">&#9197;</button>
            </div>
          </div>
          <div style="width:230px;background:#16234a;border-left:1px solid #0a1633;display:flex;flex-direction:column;">
            <div style="padding:6px 8px;font-size:10px;color:#9fb4dc;border-bottom:1px solid #0a1633;">Now Playing — <i id="wmp-count">My Playlist (8)</i></div>
            <div id="wmp-list" style="flex:1;overflow:auto;font-size:11px;"></div>
          </div>
        </div>`;
      const win = WM.openWindow({ title: 'Windows Media Player', icon: ICON.wmp, app: 'wmp', width: 700, height: 500, body });
      const list = body.querySelector('#wmp-list');
      const vid = body.querySelector('#wmp-video'), cv = body.querySelector('#wmp-viz');
      let cur = -1, playing = false, pos = 0, raf = null, t0 = null, audio = null;
      const tracks = WMP_TRACKS.slice();
      const srcOf = tr => tr.src || Media.srcFor(tr.t);
      const isVid = tr => tr.video || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(srcOf(tr) || '');
      /* opened from the desktop ("Star Wars Kid.avi") or File > Open */
      if (file && (file.src || Media.srcFor(file.name || ''))) {
        tracks.unshift({ t: file.name || 'Media file', a: file.kind === 'video' ? 'My Videos' : 'My Music',
          len: 0, src: file.src || Media.srcFor(file.name), video: file.kind === 'video' });
      }
      function fmt(s) { return Math.floor((s || 0) / 60) + ':' + String(Math.floor((s || 0) % 60)).padStart(2, '0'); }
      function lenOf(tr) {
        if (audio && audio.duration) return audio.duration;
        if (vid.src && vid.duration) return vid.duration;
        return tr.len || 0;
      }
      function drawList() {
        list.innerHTML = '';
        body.querySelector('#wmp-count').textContent = 'My Playlist (' + tracks.length + ')';
        tracks.forEach((tr, i) => {
          const r = el('div');
          r.style.cssText = 'padding:4px 8px;cursor:pointer;display:flex;justify-content:space-between;gap:6px;';
          r.innerHTML = '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (i + 1) + '. ' + tr.t +
            (srcOf(tr) ? ' \u25CF' : '') + ' <span style="color:#7f93bd;">— ' + tr.a + '</span></span><span style="opacity:.6;">' + fmt(tr.len) + '</span>';
          r.title = tr.t + (srcOf(tr) ? '  — media file' : '  — simulated (add a src in js/config.js)');
          r.addEventListener('click', () => { play(i); });
          r.addEventListener('mouseenter', () => r.style.background = '#24407c');
          r.addEventListener('mouseleave', () => r.style.background = cur === i && playing ? '#0e5aa8' : '');
          list.append(r);
        });
      }
      function stopMedia() {
        if (audio) { audio.onended = null; audio.pause(); audio = null; }
        vid.pause(); vid.removeAttribute('src'); vid.load();
        cv.style.display = ''; vid.style.display = 'none';
      }
      function play(i) {
        stopMedia();
        cur = ((i % tracks.length) + tracks.length) % tracks.length; pos = 0; playing = true; t0 = null;
        const tr = tracks[cur], src = srcOf(tr);
        [...list.children].forEach((c, k) => c.style.background = k === cur ? '#0e5aa8' : '');
        body.querySelector('#wmp-title').textContent = 'Now playing: ' + (tr.a ? tr.a + ' — ' : '') + tr.t;
        body.querySelector('#wmp-rate').textContent = src ? (isVid(tr) ? 'video' : 'MP3') : '128kbps';
        win.setTitle(tr.t + ' - Windows Media Player');
        Sound.play('nav', { vol: .3 });
        if (src && isVid(tr)) {
          cv.style.display = 'none'; vid.style.display = 'block';
          vid.src = src;
          const p = vid.play();
          if (p) p.catch(() => { vid.muted = true; vid.play().catch(() => {}); });
        } else if (src) {
          audio = new Audio(src);
          audio.onended = () => play((cur + 1) % tracks.length);
          audio.onerror = () => { WM.msg('Windows Media Player', 'Windows Media Player cannot play the file. The file "' + tr.t + '" could not be found — check the path in js/config.js (RETRO.media.sources).', { type: 'error', width: 440 }); stopAll(); };
          audio.play().catch(() => {});
        }
        loop();
      }
      function loop() {
        cancelAnimationFrame(raf);
        const cx = cv.getContext('2d');
        const bars = 32, vals = Array.from({ length: bars }, () => Math.random());
        const tick = ts => {
          raf = requestAnimationFrame(tick);
          if (!playing) return;
          const tr = tracks[cur], len = lenOf(tr);
          if (audio) pos = audio.currentTime;
          else if (vid.src && !vid.paused) pos = vid.currentTime;
          else { if (t0 == null) t0 = ts - pos * 1000; pos = (ts - t0) / 1000; }
          body.querySelector('#wmp-prog').style.width = (len ? Math.min(100, pos / len * 100) : 0) + '%';
          body.querySelector('#wmp-t0').textContent = fmt(pos);
          body.querySelector('#wmp-t1').textContent = '-' + fmt(Math.max(0, len - pos));
          if (!vid.src) {
            cx.clearRect(0, 0, 300, 120);
            for (let i = 0; i < bars; i++) {
              vals[i] += (Math.random() - .5) * .35; vals[i] = Math.max(.05, Math.min(1, vals[i]));
              const h = vals[i] * 110, w = 300 / bars - 2;
              const g = cx.createLinearGradient(0, 120 - h, 0, 120);
              g.addColorStop(0, '#8fd0ff'); g.addColorStop(.5, '#3ba3e6'); g.addColorStop(1, '#0e5aa8');
              cx.fillStyle = g; cx.fillRect(i * (300 / bars), 120 - h, w, h);
            }
          }
          if (len && pos >= len - .35 && !(audio || vid.src)) { play((cur + 1) % tracks.length); }
        };
        raf = requestAnimationFrame(tick);
      }
      vid.addEventListener('ended', () => play((cur + 1) % tracks.length));
      function stopAll() {
        playing = false; pos = 0; t0 = null; stopMedia();
        body.querySelector('#wmp-prog').style.width = '0%';
        body.querySelector('#wmp-title').textContent = 'Player stopped';
        cancelAnimationFrame(raf);
        win.setTitle('Windows Media Player');
      }
      body.querySelector('#wmp-seek').addEventListener('click', e => {
        const tr = tracks[cur]; if (!tr) return;
        const len = lenOf(tr); if (!len) return;
        const r = e.currentTarget.getBoundingClientRect();
        const to = (e.clientX - r.left) / r.width * len;
        pos = to; t0 = null;
        if (audio) audio.currentTime = to; else if (vid.src) vid.currentTime = to;
      });
      function actIt(act) {
        if (act === 'play') { if (cur < 0) { play(0); return; }
          playing = true; if (audio) audio.play().catch(() => {}); if (vid.src) vid.play().catch(() => {}); loop(); }
        else if (act === 'pause') { playing = false; t0 = null; if (audio) audio.pause(); if (vid.src) vid.pause(); }
        else if (act === 'stop') stopAll();
        else if (act === 'next') play(cur + 1);
        else if (act === 'prev') play(cur - 1);
      }
      body.querySelector('#wmp-transport').addEventListener('click', e => {
        const b = e.target.closest('.wmp-b'); if (!b) return; actIt(b.dataset.act);
      });
      function openMedia(name, src, video) {
        tracks.unshift({ t: name.replace(/\.[^.]+$/, ''), a: video ? 'My Videos' : 'My Music', len: 0, src, video });
        drawList(); play(0);
        WM.balloon('Windows Media Player', (video ? 'Video' : 'File') + ' ' + name + ' opened.', ICON.wmp9);
      }
      WM.setMenu(win, [
        { label: '<u>F</u>ile', items: () => [
          { label: 'Open\u2026', action: () => Media.pickFile('audio/*,video/*', (url, name) =>
            openMedia(name, url, /\.(mp4|webm|mov|m4v|avi)$/i.test(name))) },
          { label: 'Open Media URL\u2026', action: () => {
            const inp = el('input', 'xp-input'); inp.value = 'http://'; inp.style.cssText = 'width:100%;margin-top:6px;';
            const t = el('div'); t.style.cssText = 'flex:1;'; t.append('URL of MP3 or video file:', inp);
            WM.dialog({ title: 'Open URL', icon: ICON.wmp9, width: 440, height: 'auto', text: t,
              buttons: [{ label: 'OK', value: 'ok', def: true }, { label: 'Cancel', value: null }] })
              .then(r => { const u = (inp.value || '').trim();
                if (r === 'ok' && u && u !== 'http://') openMedia(u.replace(/^.*\//, '').replace(/\?.*$/, '') || 'URL media', u, /\.(mp4|webm|mov|m4v|avi)$/i.test(u)); });
          } }, '-',
          { label: 'Exit', action: () => win.close() } ] },
        { label: '<u>P</u>lay', items: () => [
          { label: playing ? 'Pause' : 'Play', action: () => actIt('play') },
          { label: 'Stop', action: () => actIt('stop') }, '-',
          { label: 'Next', action: () => actIt('next') },
          { label: 'Previous', action: () => actIt('prev') } ] },
        { label: '<u>V</u>iew', items: () => [
          { label: 'Full Mode', action: () => WM.msg('Full Mode', 'To exit full mode, press Alt+Enter.\n\nAlt+Enter is currently being used by Winamp. Try again in 2007.', { type: 'error' }) } ] },
        { label: '<u>H</u>elp', items: () => [
          { label: 'About Windows Media Player', action: () => WM.msg('About Windows Media Player',
            'Windows Media\nVersion 9.00.00.2980\n\nNow playing: ' + (cur >= 0 ? tracks[cur].t : 'nothing') +
            '\n\nReal playback: files listed in js/config.js (RETRO.media.sources)\nand anything opened with File \u2192 Open\u2026 play for real.', { type: 'info', width: 420 }) } ] }
      ]);
      const st = document.createElement('style');
      st.textContent = '.wmp-b{width:34px;height:30px;border-radius:4px;border:1px solid #6f89b8;background:linear-gradient(180deg,#33518f,#1a2c55);color:#cfe3ff;font-size:12px;cursor:pointer;}.wmp-b:hover{filter:brightness(1.3);}';
      body.append(st);
      win.onClose = () => { playing = false; stopMedia(); cancelAnimationFrame(raf); win.setTitle('Windows Media Player'); };
      drawList();
      play(0); playing = false; /* start paused for politeness */
      return win;
    }
  };

  /* ================================================================
     EXPLORER WINDOWS
  ================================================================ */
  function fileRow(name, icon, onDbl, w, extra) {
    const r = el('div');
    r.style.cssText = 'display:flex;align-items:center;gap:6px;padding:2px 6px;cursor:default;';
    r.innerHTML = '<img src="' + icon + '" style="width:16px;height:16px;" data-fb="' + ICON.appWindow + '"><span>' + name + '</span>' + (extra || '');
    r.addEventListener('mouseenter', () => { if (!r._sel) r.style.background = '#E8E8F8'; });
    r.addEventListener('mouseleave', () => { if (!r._sel) r.style.background = ''; });
    r.addEventListener('click', () => { r.parentNode.querySelectorAll('div').forEach(s => { s._sel = false; s.style.background = ''; }); r._sel = true; r.style.background = '#316AC5'; r.style.color = '#fff'; });
    r.addEventListener('dblclick', () => onDbl && onDbl());
    r.style.color = '';
    return r;
  }
  function sidebar(title, items) {
    const s = el('div');
    s.style.cssText = 'width:180px;flex:0 0 180px;background:linear-gradient(90deg,#728DDB,#A6B9E7);padding:10px;overflow:auto;';
    const b = el('div');
    b.style.cssText = 'background:#D6DFEF;border-radius:4px;margin-bottom:12px;overflow:hidden;';
    b.innerHTML = '<div style="background:linear-gradient(90deg,#5A77C8,#728DDB);color:#fff;padding:4px 8px;font-weight:bold;font-size:11px;">' + title + '</div>';
    const inner = el('div'); inner.style.cssText = 'padding:8px;';
    items.forEach(it => {
      const a = el('div');
      a.style.cssText = 'display:flex;gap:6px;align-items:center;color:#0C398D;margin-bottom:8px;font-size:11px;' + (it.icon ? '' : 'color:#333;');
      if (it.icon) a.innerHTML = '<img src="' + it.icon + '" style="width:16px;height:16px;" data-fb="' + ICON.appWindow + '">';
      const sp = el('span'); sp.textContent = it.label;
      if (it.icon) sp.style.cssText = 'text-decoration:underline;cursor:pointer;';
      a.append(sp);
      if (it.action) a.addEventListener('click', it.action);
      inner.append(a);
    });
    b.append(inner); s.append(b);
    return s;
  }
  function explorerWindow(cfg) {
    const t1 = el('div', 'xp-toolbar');
    const mk = (l, fn) => { const b = el('button', 'tbr-btn'); b.textContent = l; if (fn) b.addEventListener('click', fn); t1.append(b); return b; };
    mk('◀ Back', () => WM.msg('Explorer', 'There are no previous pages in your history.', { type: 'info' }));
    mk('Forward ▶').disabled = true;
    mk('⬆ Up', cfg.up);
    t1.append(el('div', 'tbr-sep'));
    mk('🔍 Search', () => APPS.search.launch()); mk('📁 Folders', () => WM.msg('Explorer', cfg.title, { type: 'info' }));
    const t2 = el('div', 'xp-toolbar');
    t2.innerHTML = '<span style="color:#444;">Address</span>';
    const combo = el('div', 'tbr-combo'); combo.style.flex = '1';
    combo.innerHTML = '<img src="' + (cfg.addrIcon || ICON.folder) + '" style="width:16px;height:16px;" data-fb="' + ICON.folder + '"><span>' + cfg.title + '</span>';
    const goB = el('button', 'tbr-btn'); goB.textContent = 'Go';
    t2.append(combo, goB);
    const content = el('div');
    content.style.cssText = 'flex:1;display:flex;min-height:0;';
    const files = el('div');
    files.style.cssText = 'flex:1;background:#fff;overflow:auto;padding:8px;-webkit-user-select:text;user-select:text;';
    content.append(sidebar('File and Folder Tasks', cfg.tasks || []), sidebar('System Tasks', cfg.sys || []), files);
    const status = el('div', 'xp-status');
    const win = WM.openWindow({ title: cfg.title, icon: cfg.icon || ICON.explorer, app: cfg.app || 'explorer', width: cfg.width || 640, height: cfg.height || 440,
      body: (() => { const b = el('div'); b.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#ECE9D8;'; b.append(t1, t2, content, status); return b; })(),
      menubar: [
        { label: '<u>F</u>ile', items: () => [{ label: 'Close', action: () => win.close() }] },
        { label: '<u>E</u>dit', items: () => [{ label: 'Select All', action: () => {} }] },
        { label: '<u>V</u>iew', items: () => [{ label: 'Refresh', accel: 'F5', action: () => cfg.refresh && cfg.refresh() }] },
        { label: '<u>F</u>avorites', items: () => [{ label: 'Customize Favorites...', action: () => WM.msg('Add Favorite', 'Adding "' + cfg.title + '" to your Favorites folder...', { type: 'info' }) }] },
        { label: '<u>T</u>ools', items: () => [{ label: 'Map Network Drive...', action: () => WM.msg('Map Network Drive', 'Network logon failed: no domain controller could be contacted.', { type: 'error' }) }, { label: 'Folder Options...', action: () => WM.msg('Folder Options', 'Tasks are shown by default (this simulation behaves like Windows XP).', { type: 'info' }) }] },
        { label: '<u>H</u>elp', items: () => [{ label: 'About Internet Explorer', action: () => WM.msg('About Windows', 'Microsoft Windows XP\nVersion 5.1 (Build 2600.xSP2)', { type: 'info' }) }] }
      ]});
    win.body.style.background = '#ECE9D8';
    win.body.innerHTML = '';
    win.body.append(t1, t2, content, status);
    win.files = files; win.status = status;
    status.textContent = cfg.status || ((cfg.count || 0) + ' objects');
    cfg.render && cfg.render(files, status);
    return win;
  }

  APPS['explorer-mycomputer'] = {
    launch() {
      return explorerWindow({ title: 'My Computer', icon: ICON.myComputer, app: 'explorer-mycomputer', width: 640, height: 430,
        count: 5, addrIcon: ICON.myComputer,
        sys: [{ label: 'View system information', icon: ICON.sysprops, action: () => APPS.winver.launch() }, { label: 'Add or remove programs', icon: ICON.controlPanel, action: () => APPS.control.launch() }, { label: 'Change a setting', icon: ICON.controlPanel, action: () => APPS.control.launch() }],
        tasks: [{ label: 'View pictures', icon: ICON.myPictures, action: () => APPS['explorer-pictures'].launch() }, { label: 'Make a new folder', icon: ICON.folder, action: () => WM.msg('Make New Folder', 'Access is denied. (just kidding, this is a simulation)', { type: 'info' }) }],
        render(files) {
          files.innerHTML = '<div style="color:#666;font-size:11px;padding:2px 4px 10px;">Files Stored on This Computer</div>';
          files.append(
            fileRow('Shared Documents', ICON.folder, () => APPS['explorer-documents'].launch()),
            fileRow("User's Documents", ICON.myDocuments, () => APPS['explorer-documents'].launch()),
            fileRow("User's Pictures", ICON.myPictures, () => APPS['explorer-pictures'].launch()),
            fileRow('Music Files', ICON.myMusic, () => APPS.wmp.launch()),
            el('hr'),
          );
          const h = el('div'); h.style.cssText = 'color:#666;font-size:11px;padding:10px 4px;'; h.textContent = 'Hard Disk Drives'; files.append(h);
          const c = fileRow('Local Disk (C:)', ICON.localDisk, () => WM.msg('Local Disk (C:)', '3.12 GB free of 37.2 GB', { type: 'info' }));
          c.querySelector('span').innerHTML = 'Local Disk (C:) <span style="color:#888;">&nbsp;3.12 GB free</span>';
          files.append(c);
          const h2 = el('div'); h2.style.cssText = 'color:#666;font-size:11px;padding:10px 4px;'; h2.textContent = 'Devices with Removable Storage'; files.append(h2);
          files.append(fileRow('3½ Floppy (A:)', ICON.floppy, () => WM.msg('A:\\', 'There is no disk in drive A:. Insert a disk and then try again.', { type: 'error' })));
          files.append(fileRow('DVD-RW Drive (D:)', ICON.cdromRom, () => WM.msg('(D:)', 'Please insert a disc into drive D:', { type: 'warn' })));
          const h3 = el('div'); h3.style.cssText = 'color:#666;font-size:11px;padding:10px 4px;'; h3.textContent = 'Network Drives'; files.append(h3);
          files.append(fileRow('Y: (\\\\HOME-SRV\\Public)', ICON.folder, () => WM.msg('Network', 'Cannot make a network connection: The network provider does not support the requested operation.', { type: 'error' })));
        }
      });
    }
  };
  APPS['explorer-documents'] = {
    launch() {
      return explorerWindow({ title: "User's Documents", icon: ICON.myDocuments, app: 'explorer-documents', width: 620, height: 420, count: 7, addrIcon: ICON.myDocuments,
        render(files) {
          files.append(
            fileRow('My Pictures', ICON.myPictures, () => APPS['explorer-pictures'].launch()),
            fileRow('My Music', ICON.myMusic, () => APPS.wmp.launch()),
            fileRow('My Videos', ICON.myMusic, () => explorerWindow({ title: 'My Videos', icon: ICON.myMusic, app: 'explorer-movies', width: 560, height: 320, count: 1, addrIcon: ICON.myMusic,
              render(files) {
                files.append(fileRow('Star Wars Kid.avi', ICON.avi, () => APPS.wmp.launch({ name: 'Star Wars Kid.avi', kind: 'video' })));
              } })),
            fileRow('resume.doc', ICON.doc, () => WM.msg('resume.doc', 'Windows cannot open this file.\n\nTo open this file, you need Microsoft Word, which is not installed. (Try Paint!)', { type: 'error', width: 420 })),
            fileRow('homework final FINAL v3.doc', ICON.doc, () => WM.msg('Save As', 'This file is locked by another user: "Administrator". Try again in 1999.', { type: 'error' })),
            fileRow('readme.txt', ICON.txt, () => APPS.notepad.launch({ name: 'readme.txt' })),
            fileRow('secret.txt', ICON.txt, () => APPS.notepad.launch({ name: 'secret.txt' })),
            fileRow('hamsterdance.htm', ICON.html, () => WM.openWeb('http://www.google.com/search?q=hamster+dance'))
          );
        }
      });
    }
  };
  APPS['explorer-pictures'] = {
    launch() {
      const w = explorerWindow({ title: "User's Pictures", icon: ICON.myPictures, app: 'explorer-pictures', width: 640, height: 450, addrIcon: ICON.myPictures,
        render(files, status) {
          files.style.cssText = 'flex:1;background:#fff;overflow:auto;padding:12px;';
          const grid = el('div');
          grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px;';
          PHOTOS.forEach(p => {
            const t = el('div');
            t.style.cssText = 'text-align:center;padding:6px;cursor:pointer;border:1px solid transparent;';
            t.innerHTML = '<img src="' + p.f + '" style="width:120px;height:84px;object-fit:cover;border:1px solid #999;background:#2c57a5;"><div style="font-size:11px;margin-top:3px;">' + p.name + '</div>';
            t.addEventListener('mouseenter', () => t.style.background = '#E8E8F8');
            t.addEventListener('mouseleave', () => t.style.background = '');
            t.addEventListener('dblclick', () => viewPhoto(p));
            grid.append(t);
          });
          files.append(grid);
          status.textContent = PHOTOS.length + ' objects';
        }
      });
      function viewPhoto(p) {
        const img = el('img'); img.src = p.f; img.style.cssText = 'max-width:100%;max-height:100%;margin:auto;object-fit:contain;';
        const win2 = WM.openWindow({ title: p.name + ' - Windows Picture and Fax Viewer', icon: ICON.myPictures, width: 620, height: 470,
          body: (() => { const b = el('div'); b.style.cssText = 'background:#3A3A3A;display:flex;align-items:center;justify-content:center;'; b.append(img); return b; })(),
          menubar: [{ label: 'File', items: () => [
            { label: 'Set As Desktop (R)', action: () => { Main.setWallpaper(p.f); WM.msg('Desktop', p.name + ' is now your desktop background.', { type: 'info' }); } },
            '-', { label: 'Close', action: () => win2.close() } ] }],
          status: p.name + '    Right-click a picture, and then click Set As Desktop.' });
      }
      return w;
    }
  };
  APPS['explorer-recyclebin'] = {
    launch() {
      let winRef = null;
      const w = explorerWindow({ title: 'Recycle Bin', icon: Shell.binFull() ? ICON.recycleFull : ICON.recycleEmpty, app: 'explorer-recyclebin', width: 600, height: 400, addrIcon: ICON.recycleEmpty,
        tasks: [
          { label: 'Empty the Recycle Bin', icon: ICON.delete, action: () => emptyIt() },
          { label: 'Restore all items', icon: ICON.restore, action: () => restoreAll() }
        ],
        refresh: () => render(),
        render: render
      });
      winRef = w;
      function render(fl, st) {
        const files = fl || winRef.files;
        files.innerHTML = '';
        if (!Shell.bin.length) {
          files.innerHTML = '<div style="color:#666;padding:30px;text-align:center;font-size:12px;">The Recycle Bin is empty.</div>';
        } else Shell.bin.forEach((it, i) => {
          files.append(fileRow(it.name, it.icon || ICON.txt, () => WM.msg(it.name, 'This item is in the Recycle Bin. Use "Restore all items" to put it back.', { type: 'info' })));
        });
        const set = t => winRef ? winRef.setStatus(t) : (st && (st.textContent = t));
        set(Shell.bin.length + ' objects');
        if (winRef) winRef.setIcon(Shell.binFull() ? ICON.recycleFull : ICON.recycleEmpty);
      }
      function emptyIt() {
        if (!Shell.bin.length) return WM.msg('Recycle Bin', 'The Recycle Bin is already empty.', { type: 'info' });
        WM.dialog({ title: 'Confirm Multiple File Delete', text: 'Are you sure you want to delete these ' + Shell.bin.length + ' items?', icon: ICON.question,
          buttons: [{ label: 'Yes', value: true, def: true }, { label: 'No', value: false }] }).then(v => { if (v) { Shell.emptyBin(); render(); } });
      }
      function restoreAll() { const items = Shell.restoreAll(); render(); if (items.length) WM.msg('Restore', 'Restored ' + items.length + ' item(s) to the Desktop.', { type: 'info' }); }
      Shell._refresh = () => { if (w.el.isConnected) render(); };
      return w;
    }
  };

  /* ================================================================
     CONTROL PANEL / DISPLAY PROPS / WINVER / DATE TIME / SEARCH / HELP
  ================================================================ */
  APPS.control = {
    launch() {
      const w = explorerWindow({ title: 'Control Panel', icon: ICON.controlPanel, app: 'control', width: 620, height: 420, addrIcon: ICON.controlPanel,
        render(files) {
          const grid = el('div');
          grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;padding:6px;';
          const items = [
            ['Display', ICON.display, () => APPS.display.launch()],
            ['Date and Time', ICON.timedate || ICON.help, () => APPS.timedate.launch()],
            ['System', ICON.sysprops, () => APPS.winver.launch()],
            ['Sounds and Audio Devices', ICON.volume, () => { Sound.setMuted(!Sound.muted); WM.msg('Sounds and Audio Devices', 'System sounds are now ' + (Sound.muted ? 'MUTED (funeral home mode)' : 'ON') + '.', { type: 'info' }); }],
            ['Network Connections', ICON.network, () => WM.msg('Local Area Connection Status', 'Status: Connected\nSpeed: 100.0 Mbps\nDuration: 0 days 0:14:22\n\n[ View Performance ] [ Support ]', { type: 'info' })],
            ['User Accounts', ICON.userAccounts, () => WM.msg('User Accounts', 'Pick a Task\n• Change your account name\n• Create a new account\n\n(only "User" exists on this PC)', { type: 'info' })],
            ['Add or Remove Programs', ICON.programs, () => WM.msg('Currently installed programs', 'MSN Messenger (7.5)\nICQ (2003b)\nWindows Media Player\nWinamp 2.91\nHamsterDance screensaver (recommended)', { type: 'info' })],
            ['Printers and Faxes', ICON.printer, () => WM.msg('Printers and Faxes', 'No printers installed. The HP OfficeJet 5510 is "offline, like always".', { type: 'info' })],
            ['Windows Update', ICON.update, () => WM.msg('Windows Update', 'Checking for updates...\n\nWindows is up to date. (it will stay that way forever)', { type: 'info' })],
            ['Taskbar and Start Menu', ICON.taskmgr, () => WM.msg('Taskbar and Start Menu', 'Classic look already selected. You are welcome.', { type: 'info' })]
          ];
          items.forEach(([label, icon, fn]) => {
            const c = el('div');
            c.style.cssText = 'width:150px;display:flex;gap:8px;align-items:center;padding:8px;cursor:pointer;border:1px solid transparent;';
            c.innerHTML = '<img src="' + icon + '" style="width:32px;height:32px;" data-fb="' + ICON.appWindow + '"><span style="font-size:11px;">' + label + '</span>';
            c.addEventListener('mouseenter', () => { c.style.background = '#E8E8F8'; c.style.borderColor = '#B8C8E0'; });
            c.addEventListener('mouseleave', () => { c.style.background = ''; c.style.borderColor = 'transparent'; });
            c.addEventListener('dblclick', fn); c.addEventListener('click', fn);
            grid.append(c);
          });
          files.append(grid);
        }});
      return w;
    }
  };
  APPS.display = {
    launch() {
      const WALLS = [['Bliss', WALLP.blissHQ], ['Autumn', WALLP.autumn], ['Azul', WALLP.azul], ['Tulips', WALLP.tulips], ['Follow', WALLP.follow], ['Moonflower', WALLP.moonflower], ['Red Moon Desert', WALLP.desert], ['Radiance', WALLP.radiance], ['Wind', WALLP.wind], ['Ascent', WALLP.ascent]];
      const body = el('div');
      body.style.cssText = 'background:#ECE9D8;padding:12px;height:100%;display:flex;flex-direction:column;gap:10px;';
      body.innerHTML = `
        <div style="display:flex;gap:2px;">
          <div style="background:#ECE9D8;border:1px solid #919b9c;border-bottom-color:#ECE9D8;padding:3px 12px;border-radius:4px 4px 0 0;position:relative;top:1px;font-weight:bold;">Desktop</div>
          <div style="border:1px solid transparent;padding:3px 12px;color:#444;">Screen Saver</div>
          <div style="border:1px solid transparent;padding:3px 12px;color:#444;">Appearance</div>
        </div>
        <div style="display:flex;gap:16px;flex:1;min-height:0;">
          <div style="width:200px;display:flex;flex-direction:column;gap:6px;">
            <div style="border:1px solid #7F9DB9;background:#fff;overflow:auto;flex:1;" id="dp-list"></div>
          </div>
          <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
            <div style="width:170px;height:130px;border:3px solid #6b6b6b;border-radius:6px;background:#2c57a5 center/cover no-repeat;box-shadow:2px 2px 5px rgba(0,0,0,.3);" id="dp-prev"></div>
            <div style="display:flex;gap:6px;align-items:center;"><span>Background:</span><button class="xp-btn" id="dp-browse">Browse...</button></div>
            <div style="display:flex;gap:6px;align-items:center;"><span>Position:</span><select class="xp-select" style="width:110px;"><option>Stretch</option><option>Center</option><option>Tile</option></select></div>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;"><button class="xp-btn default" id="dp-ok">OK</button><button class="xp-btn" id="dp-cancel">Cancel</button><button class="xp-btn" id="dp-apply">Apply</button></div>`;
      const win = WM.openWindow({ title: 'Display Properties', icon: ICON.display, app: 'display', width: 470, height: 420, minimizable: false, maximizable: false, resizable: false, body });
      const list = body.querySelector('#dp-list'), prev = body.querySelector('#dp-prev');
      let chosen = WALLS[0];
      WALLS.forEach(([n, u]) => {
        const r = el('div');
        r.style.cssText = 'padding:3px 6px;cursor:default;font-size:11px;';
        r.textContent = n;
        r.addEventListener('click', () => { list.querySelectorAll('div').forEach(x => x.style.background = ''); r.style.background = '#316AC5'; r.style.color = '#fff'; chosen = [n, u]; prev.style.backgroundImage = 'url(' + u + ')'; });
        list.append(r);
      });
      prev.style.backgroundImage = 'url(' + chosen[1] + ')';
      body.querySelector('#dp-browse').addEventListener('click', () => WM.msg('Choose Picture', 'Only the bundled XP wallpapers are available offline.', { type: 'info' }));
      const apply = () => Main.setWallpaper(chosen[1]);
      body.querySelector('#dp-apply').addEventListener('click', apply);
      body.querySelector('#dp-ok').addEventListener('click', () => { apply(); win.close(); });
      body.querySelector('#dp-cancel').addEventListener('click', () => win.close());
      return win;
    }
  };
  APPS.timedate = {
    launch() {
      const now = new Date();
      WM.msg('Date and Time Properties', 'Date:  ' + now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) +
        '\nTime: ' + now.toLocaleTimeString() +
        '\n\nTime zone: (GMT-08:00) Pacific Time (US & Canada)\n\nAdjust for daylight saving time ☑', { type: 'info', width: 400 });
    }
  };
  APPS.winver = {
    launch() {
      const win = WM.openWindow({ title: 'About Windows', icon: ICON.windowsLogo, width: 440, height: 250, minimizable: false, maximizable: false, resizable: false });
      win.body.style.background = '#ECE9D8';
      win.body.innerHTML = `
        <div style="padding:16px;display:flex;flex-direction:column;gap:12px;height:100%;">
          <div style="display:flex;gap:14px;align-items:center;">
            <img src="${ICON.windowsLogo}" style="width:56px;height:44px;" data-fb="${ICON.myComputer}">
            <div class="dlg-text" style="font-size:12px;"><b>Microsoft Windows XP<br>(TM) Version 5.1 (Build 2600.xSP2)</b></div>
          </div>
          <div class="dlg-text">This product is licensed to:</div>
          <div class="dlg-text" style="padding-left:20px;line-height:1.6;">User<br>Home Network<br><br>Physical memory available to system: <b>512 MB</b></div>
          <div style="flex:1;"></div>
          <div style="text-align:right;"><button class="xp-btn default" onclick="this.closest('.xp-win').__w.close()">OK</button></div>
        </div>`;
      win.el.__w = win;
      win.body.querySelector('.xp-btn').addEventListener('click', () => win.close());
      return win;
    }
  };
  APPS.search = {
    launch() {
      const body = el('div');
      body.style.cssText = 'display:flex;height:100%;background:#ECE9D8;';
      body.innerHTML = `
        <div style="width:220px;background:linear-gradient(180deg,#6f90dd,#728DDB);padding:14px;color:#fff;">
          <div style="font-size:15px;font-weight:bold;margin-bottom:12px;">Search Computer</div>
          <div style="margin-bottom:6px;">What do you want to search for?</div>
          <input class="xp-input" id="s-q" style="width:100%;" placeholder="All and part of the file name">
          <button class="xp-btn" id="s-go" style="margin-top:10px;width:100%;">Search</button>
          <div style="margin-top:14px;font-size:11px;opacity:.9;">Tip: try "hamster" or "resume".</div>
        </div>
        <div style="flex:1;background:#fff;overflow:auto;padding:12px;" id="s-res"><div style="color:#666;">Type something and press Search.</div></div>`;
      const win = WM.openWindow({ title: 'Search Results', icon: ICON.search, app: 'search', width: 640, height: 420, body });
      body.querySelector('#s-go').addEventListener('click', () => {
        const res = body.querySelector('#s-res');
        res.innerHTML = '<div style="color:#666;">Searching 1 drive... (0 of 28,921 files indexed)</div>';
        setTimeout(() => {
          res.innerHTML = '';
          const found = [['resume.doc', ICON.doc, () => WM.msg('resume.doc', 'Word is not installed (see My Computer > readme.txt).', { type: 'error' })],
            ['readme.txt', ICON.txt, () => APPS.notepad.launch({ name: 'readme.txt' })],
            ['secret.txt', ICON.txt, () => APPS.notepad.launch({ name: 'secret.txt' })],
            ['My Summer Trip 001.jpg', ICON.myPictures, () => APPS['explorer-pictures'].launch()],
            ['hamsterdance.htm', ICON.html, () => WM.openWeb('http://www.google.com/search?q=hamster+dance')]];
          const h = el('div'); h.style.cssText = 'color:#444;margin-bottom:8px;'; h.textContent = '48 files found  (Showing top ' + found.length + ')';
          res.append(h);
          found.forEach(([n, i, fn]) => res.append(fileRow(n, i, fn)));
        }, 1200);
      });
      return win;
    }
  };
  APPS.help = {
    launch() {
      const win = WM.openWindow({ title: 'Help and Support Center', icon: ICON.help, width: 620, height: 440, app: 'help' });
      win.body.style.background = '#fff';
      win.body.innerHTML = `
        <div style="height:100%;display:flex;flex-direction:column;font-family:Verdana;">
          <div style="background:linear-gradient(90deg,#3a6ea5,#7ba2d0);color:#fff;padding:10px 14px;font-size:17px;">Help and Support Center</div>
          <div style="padding:20px;flex:1;">
            <div style="font-size:13px;color:#333;margin-bottom:14px;">Pick a Help task</div>
            ${[['Fix a problem', 'Internet connection, sound, printers...'], ['What\u2019s new in Windows XP', 'Learn about the coolest OS ever shipped'], ['Connect to the Internet', 'It works, trust us'], ['Remote Assistance', 'Ask Mom for help without yelling across the house']]
              .map(([t, d]) => `<div class="help-row" style="border:1px solid #b8cbe6;background:#e8f0fb;padding:8px;margin-bottom:8px;cursor:pointer;"><b style="color:#1a5a9e;">${t}</b><div style="font-size:11px;color:#555;">${d}</div></div>`).join('')}
          </div>
        </div>`;
      win.body.querySelectorAll('.help-row').forEach(r => r.addEventListener('click', () => WM.msg('Help and Support', 'No topic is open now. To search for a topic, type a word or phrase in the Search box and click Go.', { type: 'info' })));
      return win;
    }
  };

  /* ================================================================
     TASK MANAGER
  ================================================================ */
  const PROCESSES = [
    ['System Idle Process', '0', '0 K', 0], ['System', '8', '152 K', 0], ['smss.exe', '144', '424 K', 0], ['csrss.exe', '204', '5,256 K', 0],
    ['winlogon.exe', '236', '2,884 K', 0], ['services.exe', '288', '1,624 K', 0], ['lsass.exe', '296', '5,112 K', 0], ['svchost.exe', '340', '4,948 K', 0],
    ['spoolsv.exe', '712', '4,012 K', 0], ['explorer.exe', '1,308', '24,116 K', 0], ['alg.exe', '844', '3,448 K', 0]
  ];
  APPS.taskmgr = {
    launch() {
      const win = WM.openWindow({ title: 'Windows Task Manager', icon: ICON.taskmgr, width: 470, height: 420, app: 'taskmgr', minimizable: false,
        menubar: [{ label: '<u>F</u>ile', items: () => [{ label: 'New Task (Run...)', action: () => WM.runDialog() }, '-', { label: 'Exit Task Manager', action: () => win.close() }] }] });
      win.body.style.background = '#ECE9D8';
      const tabs = ['Applications', 'Processes', 'Performance'];
      let tab = 0;
      win.body.innerHTML = `
        <div style="display:flex;flex-direction:column;height:100%;">
          <div id="tm-tabs" style="display:flex;gap:2px;padding:4px 6px 0;"></div>
          <div id="tm-page" style="flex:1;margin:0 6px 6px;border:1px solid #919b9c;background:#fff;overflow:auto;"></div>
          <div style="padding:2px 8px;font-size:11px;display:flex;justify-content:space-between;"><span id="tm-stats">Processes: 24 &nbsp; CPU Usage: 3%</span></div>
          <div style="display:flex;justify-content:flex-end;gap:8px;padding:6px;">
            <button class="xp-btn" id="tm-switch">Switch To</button><button class="xp-btn" id="tm-end">End Task</button><button class="xp-btn" id="tm-endproc" style="display:none;">End Process</button>
          </div>
        </div>`;
      const tabsEl = win.body.querySelector('#tm-tabs'), page = win.body.querySelector('#tm-page');
      tabs.forEach((t, i) => {
        const b = el('div');
        b.textContent = t;
        b.style.cssText = 'padding:3px 10px;font-size:11px;cursor:pointer;border:1px solid #919b9c;border-radius:3px 3px 0 0;';
        b.addEventListener('click', () => { tab = i; render(); });
        tabsEl.append(b); b._i = i;
      });
      let sel = null;
      function render() {
        [...tabsEl.children].forEach(b => { b.style.background = b._i === tab ? '#ECE9D8' : '#d4d0c8'; b.style.fontWeight = b._i === tab ? 'bold' : 'normal'; });
        page.innerHTML = '';
        win.body.querySelector('#tm-end').style.display = tab === 0 ? '' : 'none';
        win.body.querySelector('#tm-switch').style.display = tab === 0 ? '' : 'none';
        win.body.querySelector('#tm-endproc').style.display = tab === 1 ? '' : 'none';
        if (tab === 0) {
          const head = taskRow('Task', 'Status', ''); page.append(head);
          WM.wins.forEach(w => {
            const r = taskRow(w.title.textContent, w.isMin ? 'Running (minimized)' : (WM.active === w ? 'Running' : 'Running'), '');
            r.addEventListener('click', () => { sel = w; [...page.querySelectorAll('.tm-row')].forEach(x => x.style.background = ''); r.style.background = '#316AC5'; r.style.color = '#fff'; });
            page.append(r);
          });
          win.body.querySelector('#tm-switch').onclick = () => { if (sel) { sel.isMin ? sel.el.parentNode && (sel.el.style.display = '', sel.isMin = false, sel.el.classList.remove('minning'), sel.tkBtn && sel.tkBtn.classList.remove('flash')) : WM.focusWin(sel); } };
          win.body.querySelector('#tm-end').onclick = () => { if (sel) sel.close(); };
        } else if (tab === 1) {
          const procs = PROCESSES.slice();
          if (APPS.msn && APPS.msn.isOnline && APPS.msn.isOnline()) procs.push(['msnmsgr.exe', '1,337', '18,432 K', 0]);
          if (APPS.icq && APPS.icq.isOnline && APPS.icq.isOnline()) procs.push(['ICQ.exe', '2,048', '11,760 K', 0]);
          if (APPS.wmp._open) procs.push(['wmplayer.exe', '1,666', '42,508 K', 0]);
          const head = taskRow('Image Name', 'PID', 'Mem Usage'); page.append(head);
          procs.forEach(p => {
            const r = taskRow(p[0], p[1], p[2]);
            r.addEventListener('click', () => { [...page.querySelectorAll('.tm-row')].forEach(x => x.style.background = ''); r.style.background = '#316AC5'; r.style.color = '#fff'; sel = p; });
            page.append(r);
          });
          win.body.querySelector('#tm-endproc').onclick = () => {
            if (!sel || sel.length !== 4) return;
            if (sel[0] === 'explorer.exe') return WM.msg('Task Manager', 'Cannot terminate explorer.exe: Access is denied. (nice try)', { type: 'error' });
            if (sel[0] === 'lsass.exe') { return WM.dialog({ title: 'End Process', text: 'Ending this process may cause the system to become unstable. Are you sure you want to end lsass.exe?', icon: ICON.alert, buttons: [{ label: 'Yes', value: true, def: true }, { label: 'No', value: false }] }).then(v => { if (v) Boot.bsod(); }); }
            if (sel[0] === 'msnmsgr.exe') { APPS.msn.signOff && APPS.msn.signOff(); }
            if (sel[0] === 'ICQ.exe') { APPS.icq.signOff && APPS.icq.signOff(); }
            render();
          };
        } else {
          page.style.background = '#fff';
          page.innerHTML = `<div style="display:flex;flex-direction:column;height:100%;padding:8px;gap:8px;">
            <div style="font-size:11px;">CPU Usage <span id="perf-val" style="float:right;">3%</span></div>
            <canvas id="perf-cpu" style="border:1px solid #7f9db9;background:#000;flex:1;width:100%;height:120px;"></canvas>
            <div style="font-size:11px;">Commit (KB) <span style="float:right;color:#0a7f1e;">Total: 1,072,264 &nbsp; Limit: 2,461,632</span></div>
            <canvas id="perf-mem" style="border:1px solid #7f9db9;background:#000;height:60px;width:100%;"></canvas>
          </div>`;
          drawPerf();
        }
      }
      function taskRow(a, b, c) {
        const r = el('div', 'tm-row');
        r.style.cssText = 'display:flex;gap:8px;padding:2px 6px;font-size:11px;border-bottom:1px solid #eee;cursor:default;';
        r.innerHTML = '<span style="flex:1;">' + a + '</span><span style="width:60px;text-align:right;">' + b + '</span><span style="width:90px;text-align:right;">' + c + '</span>';
        return r;
      }
      function drawPerf() {
        const cv = page.querySelector('#perf-cpu'); if (!cv) return;
        const cx = cv.getContext('2d');
        const vals = Array(120).fill(3);
        const mem = page.querySelector('#perf-mem'), mcx = mem.getContext('2d');
        const iv = setInterval(() => {
          if (!cv.isConnected) return clearInterval(iv);
          const base = (APPS.msn && APPS.msn.isOnline && APPS.msn.isOnline()) ? 8 : 3;
          vals.push(Math.max(1, Math.min(100, base + Math.random() * 6 + (Math.random() < .05 ? 40 : 0))));
          vals.shift();
          cv.width = cv.clientWidth; cv.height = cv.clientHeight;
          cx.fillStyle = '#000'; cx.fillRect(0, 0, cv.width, cv.height);
          cx.strokeStyle = '#0a4a0a';
          for (let gx = 0; gx < cv.width; gx += 24) { cx.beginPath(); cx.moveTo(gx, 0); cx.lineTo(gx, cv.height); cx.stroke(); }
          for (let gy = 0; gy < cv.height; gy += 15) { cx.beginPath(); cx.moveTo(0, gy); cx.lineTo(cv.width, gy); cx.stroke(); }
          cx.strokeStyle = '#2eff2e'; cx.lineWidth = 1.4; cx.beginPath();
          vals.forEach((v, i) => { const x = i / (vals.length - 1) * cv.width, y = cv.height - v / 100 * cv.height; i ? cx.lineTo(x, y) : cx.moveTo(x, y); });
          cx.stroke(); cx.lineWidth = 1;
          const pv = page.querySelector('#perf-val'); if (pv) pv.textContent = Math.round(vals[vals.length - 1]) + '%';
          win.body.querySelector('#tm-stats').textContent = 'Processes: ' + (24 + (APPS.msn && APPS.msn.isOnline && APPS.msn.isOnline() ? 1 : 0)) + '   CPU Usage: ' + Math.round(vals[vals.length - 1]) + '%   CPU Usage: 2.40GHz';
          mem.width = mem.clientWidth; mem.height = mem.clientHeight;
          mcx.fillStyle = '#000'; mcx.fillRect(0, 0, mem.width, mem.height);
          const pct = 0.42 + Math.sin(Date.now() / 4000) * 0.03;
          mcx.fillStyle = '#b6f'; mcx.fillRect(2, mem.height * (1 - pct), mem.width - 4, mem.height * pct - 2);
        }, 900);
        win.onClose = () => clearInterval(iv);
      }
      render();
      return win;
    }
  };

  /* APPS aliases for CMD/Run */
  APPS.explorer = { launch: () => APPS['explorer-mycomputer'].launch() };
  APPS.wmp._open = false;
  const _wmpLaunch = APPS.wmp.launch;
  APPS.wmp.launch = function (file) { APPS.wmp._open = true; const w = _wmpLaunch(file); const oc = w.onClose; w.onClose = () => { APPS.wmp._open = false; if (oc) oc(); }; return w; };
})();
