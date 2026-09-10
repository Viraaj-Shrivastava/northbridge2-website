(function(){
  /* easter egg #2: a little something for anyone poking at devtools */
  try{
    console.log('%cNORTHBRIDGE', 'font-family:monospace;font-size:20px;font-weight:700;color:#C9FF4D;');
    console.log('%cLooking under the hood? We like that.\nIf you can read this, you can probably read code — info@northbrigde.in', 'font-family:monospace;font-size:12px;color:#97979F;');
  } catch(e){}

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* scroll reveal for anything marked data-reveal */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if('IntersectionObserver' in window && !reduce){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.remove('pre'); io.unobserve(e.target); }
      });
    }, {threshold:.15});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.remove('pre'); });
  }

  /* rotating industry word (home hero only) */
  var rotWord = document.getElementById('rotWord');
  if(rotWord){
    var words = ['furniture','logistics','consulting','architecture','recruitment'];
    if(reduce){
      rotWord.textContent = words[0];
    } else {
      var wi = 0;
      setInterval(function(){
        rotWord.classList.add('swap');
        setTimeout(function(){
          wi = (wi + 1) % words.length;
          rotWord.textContent = words[wi];
          rotWord.classList.remove('swap');
        }, 250);
      }, 2400);
    }
  }

  /* hero cursor spotlight + deck parallax (home hero only) */
  var heroEl = document.querySelector('.hero');
  var deckEl = document.getElementById('deck');
  if(heroEl && !reduce && window.matchMedia('(hover:hover)').matches){
    heroEl.addEventListener('mousemove', function(e){
      var r = heroEl.getBoundingClientRect();
      var mx = e.clientX - r.left, my = e.clientY - r.top;
      heroEl.style.setProperty('--mx', mx + 'px');
      heroEl.style.setProperty('--my', my + 'px');
      if(deckEl){
        var px = ((mx / r.width) - 0.5) * -18;
        var py = ((my / r.height) - 0.5) * -14;
        deckEl.style.setProperty('--px', px + 'px');
        deckEl.style.setProperty('--py', py + 'px');
      }
    });
    heroEl.addEventListener('mouseleave', function(){
      if(deckEl){ deckEl.style.setProperty('--px','0px'); deckEl.style.setProperty('--py','0px'); }
    });
  }

  /* metrics count-up (platform page only), triggered when the workspace panel reveals */
  var metricPanel = document.querySelector('#platform .panel, .panel:has(.num[data-target])');
  if(!metricPanel){
    // fallback for browsers without :has()
    document.querySelectorAll('.panel').forEach(function(p){
      if(!metricPanel && p.querySelector('.num[data-target]')) metricPanel = p;
    });
  }
  if(metricPanel){
    var counted = false;
    var countUp = function(){
      if(counted) return; counted = true;
      var nums = metricPanel.querySelectorAll('.num[data-target]');
      nums.forEach(function(el){
        var target = parseInt(el.dataset.target, 10) || 0;
        if(reduce){ el.textContent = target; return; }
        var start = null, dur = 900;
        function step(ts){
          if(!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target);
          if(p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    };
    if('IntersectionObserver' in window){
      var io3 = new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if(e.isIntersecting){ countUp(); io3.disconnect(); } });
      }, {threshold:.4});
      io3.observe(metricPanel);
    } else { countUp(); }
  }

  /* console typewriter (AI page only), triggered when the console reveals */
  var consoleEl = document.querySelector('.console');
  if(consoleEl){
    var typed = false;
    var typeLine = function(msgEl, cursorEl, text, speed, onDone){
      if(reduce){ msgEl.textContent = text; if(cursorEl) cursorEl.classList.add('hide'); if(onDone) onDone(); return; }
      var i = 0;
      (function tick(){
        msgEl.textContent = text.slice(0, i);
        i++;
        if(i <= text.length){ setTimeout(tick, speed); }
        else { if(cursorEl) cursorEl.classList.add('hide'); if(onDone) onDone(); }
      })();
    };
    var runTyping = function(){
      if(typed) return; typed = true;
      var qMsg = document.getElementById('qMsg'), qCursor = document.getElementById('qCursor');
      var aMsg = document.getElementById('aMsg'), aCursor = document.getElementById('aCursor');
      if(!qMsg || !aMsg) return;
      if(aCursor) aCursor.classList.add('hide');
      typeLine(qMsg, qCursor, qMsg.dataset.text, 28, function(){
        setTimeout(function(){
          if(aCursor) aCursor.classList.remove('hide');
          typeLine(aMsg, aCursor, aMsg.dataset.text, 14);
        }, 300);
      });
    };
    if('IntersectionObserver' in window){
      var io4 = new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if(e.isIntersecting){ runTyping(); io4.disconnect(); } });
      }, {threshold:.4});
      io4.observe(consoleEl);
    } else { runTyping(); }
  }

  /* subtle tilt on feature / team cards */
  if(!reduce && window.matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.feature, .team-card').forEach(function(card){
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
        card.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-2px)';
      });
      card.addEventListener('mouseleave', function(){ card.style.transform = ''; });
    });
  }

  /* cursor spotlight: a soft light that follows the real mouse cursor, on every page/section */
  if(!reduce && window.matchMedia('(hover:hover)').matches){
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    var glowShown = false;
    document.addEventListener('mousemove', function(e){
      glow.style.setProperty('--gx', e.clientX + 'px');
      glow.style.setProperty('--gy', e.clientY + 'px');
      if(!glowShown){ glowShown = true; glow.classList.add('show'); }
    });
    document.addEventListener('mouseleave', function(){ glow.classList.remove('show'); glowShown = false; });
  }
})();
