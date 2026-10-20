/* 网页工作台逻辑：纯前端，零依赖。场景数据与渲染逻辑都从仓库里内联进来。 */

(function () {
  const scenes = window.__SCENES__;
  const state = {
    scene: null,
    index: -1,
    answers: {},
    finished: false,
    choices: [],
  };

  const $ = (selector) => document.querySelector(selector);
  const picker = $('#picker');
  const grid = $('#scene-grid');
  const searchInput = $('#search');
  const workbench = $('#workbench');
  const messages = $('#messages');
  const input = $('#answer');
  const sendButton = $('#send');
  const micButton = $('#mic');
  const ttsButton = $('#tts');
  const cardSlots = $('#slots');
  const progressBar = $('#progress-bar');
  const progressLabel = $('#progress-label');
  const resultBox = $('#result');
  const resultPre = $('#result-prompt');
  const copyButton = $('#copy');
  const restartButton = $('#restart');
  const switchButton = $('#switch');

  // ---------- 语音播报（默认：触屏设备开，桌面关） ----------
  let ttsEnabled = false;
  try {
    ttsEnabled = window.matchMedia('(pointer: coarse)').matches && 'speechSynthesis' in window;
  } catch (error) {
    ttsEnabled = false;
  }
  if (!('speechSynthesis' in window)) ttsEnabled = false;

  function speak(text) {
    if (!ttsEnabled || !text) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      /* 静默失败，不影响主流程 */
    }
  }

  function renderTtsButton() {
    if (!ttsButton) return;
    if (!('speechSynthesis' in window)) {
      ttsButton.style.display = 'none';
      return;
    }
    ttsButton.textContent = ttsEnabled ? '🔊 朗读开' : '🔇 朗读关';
  }

  if (ttsButton) {
    ttsButton.addEventListener('click', () => {
      ttsEnabled = !ttsEnabled;
      if (!ttsEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
      renderTtsButton();
      if (ttsEnabled && state.scene && !state.finished) speak(state.scene.questions[state.index].ask);
    });
  }
  renderTtsButton();

  // ---------- 语音输入 ----------
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  if (SpeechRecognition && micButton) {
    recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript || '';
      input.value = (input.value ? input.value + ' ' : '') + text;
      input.focus();
    };
    recognition.onerror = () => {
      micButton.classList.remove('listening');
    };
    recognition.onend = () => {
      micButton.classList.remove('listening');
    };
    micButton.addEventListener('click', () => {
      try {
        micButton.classList.add('listening');
        recognition.start();
      } catch (error) {
        micButton.classList.remove('listening');
      }
    });
  } else if (micButton) {
    micButton.style.display = 'none';
  }

  function text(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  // ---------- 场景选择（搜索 = 精确包含 + 模糊匹配） ----------
  function searchScenes(keyword) {
    const exact = listScenes(scenes, { keyword });
    const fuzzy = matchScenes(scenes, keyword);
    const merged = [];
    for (const scene of [...exact, ...fuzzy]) {
      if (!merged.some((item) => item.id === scene.id)) merged.push(scene);
    }
    return merged;
  }

  function renderPicker(filter) {
    const keyword = (filter || '').trim();
    const visible = keyword ? searchScenes(keyword) : scenes;
    grid.innerHTML = '';
    if (!visible.length) {
      grid.appendChild(text('div', 'empty', '没有匹配的场景。可以直接选下面任意一个，或者用「一句话起步」的输入框描述你要做的事。'));
      return;
    }
    for (const scene of visible) {
      const card = text('button', 'scene-card');
      card.type = 'button';
      card.dataset.id = scene.id;
      const top = text('div', 'top');
      top.appendChild(text('span', 'icon', scene.icon || '•'));
      top.appendChild(text('span', 'title', scene.title));
      card.appendChild(top);
      card.appendChild(text('div', 'when', scene.whenToUse));
      const meta = text('div', 'meta');
      meta.appendChild(text('span', 'cat', scene.category));
      meta.appendChild(text('span', '', scene.questions.length + ' 个问题'));
      card.appendChild(meta);
      grid.appendChild(card);
    }
  }

  // ---------- 对话气泡 ----------
  function addBubble(role, content, options) {
    const bubble = text('div', 'bubble ' + role);
    if (options && options.small) bubble.classList.add('small');
    bubble.appendChild(text('div', '', content));
    if (options && options.why) bubble.appendChild(text('div', 'why', options.why));
    if (options && options.examples && options.examples.length) {
      const examples = text('div', 'examples');
      options.examples.slice(0, 4).forEach((example, index) => {
        const button = text('button', '', (index + 1) + '. ' + example);
        button.type = 'button';
        button.title = '点一下填入输入框，或直接回数字 ' + (index + 1);
        button.addEventListener('click', () => {
          input.value = example;
          input.focus();
        });
        examples.appendChild(button);
      });
      bubble.appendChild(examples);
      bubble.appendChild(text('div', 'why', '也可以直接回数字（1 / 2 / 3 / 4），或者用大白话自己写。'));
    }
    if (options && options.allowSkip) {
      const skip = text('button', 'skip', '跳过这一项（可选）');
      skip.type = 'button';
      skip.addEventListener('click', () => {
        state.answers[state.scene.questions[state.index].key] = '';
        addBubble('user', '（跳过）');
        renderCard();
        nextQuestion();
      });
      bubble.appendChild(skip);
    }
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  // ---------- 定义卡 ----------
  function renderCard() {
    if (!state.scene) return;
    const questions = state.scene.questions;
    const required = questions.filter((question) => question.required !== false);
    const answeredRequired = required.filter((question) => (state.answers[question.key] || '').trim() !== '');
    const ratio = required.length ? answeredRequired.length / required.length : 0;
    progressBar.style.width = Math.round(ratio * 100) + '%';
    progressLabel.textContent = '必填 ' + answeredRequired.length + ' / ' + required.length +
      '　可选项 ' + (questions.length - required.length) + ' 个';

    cardSlots.innerHTML = '';
    for (const question of questions) {
      const value = (state.answers[question.key] || '').trim();
      const item = text('li', 'slot ' + (value ? 'filled' : 'pending'));
      const label = text('div', 'label');
      label.appendChild(text('span', 'req', question.required === false ? '' : '*'));
      label.appendChild(text('span', '', question.ask));
      item.appendChild(label);
      item.appendChild(text('div', 'value', value || '等待你的回答…'));
      cardSlots.appendChild(item);
    }
  }

  function setComposerEnabled(enabled, placeholder) {
    input.disabled = !enabled;
    sendButton.disabled = !enabled;
    if (micButton && recognition) micButton.disabled = !enabled;
    input.placeholder = placeholder || '用大白话回答；有选项就回数字，一次只问一个…';
    if (enabled) input.focus();
  }

  function askCurrentQuestion() {
    const question = state.scene.questions[state.index];
    state.choices = question.examples || [];
    addBubble('assistant', question.ask, {
      why: question.why,
      examples: question.examples,
      allowSkip: question.required === false,
    });
    speak(question.ask);
    setComposerEnabled(true);
    input.value = '';
  }

  function nextQuestion() {
    state.index += 1;
    if (state.index >= state.scene.questions.length) {
      finish();
      return;
    }
    askCurrentQuestion();
  }

  function finish() {
    state.finished = true;
    const result = renderPrompt(scenes, state.scene.id, state.answers);
    resultPre.textContent = result.prompt;
    resultBox.classList.remove('hidden');
    setComposerEnabled(false, '已经生成，可直接复制右边的提示词');
    if (result.missing.length) {
      addBubble('assistant', '还有必填项没回答：' + result.missing.join('、') + '，可以点「重来」补上。', { small: true });
    } else {
      addBubble('assistant', '完成。右边就是成品提示词，复制走就能用。', { small: true });
      speak('完成，右边的提示词可以直接复制使用。');
    }
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function startScene(sceneId) {
    const scene = findScene(scenes, sceneId);
    if (!scene) return;
    state.scene = scene;
    state.index = -1;
    state.answers = {};
    state.finished = false;
    messages.innerHTML = '';
    resultBox.classList.add('hidden');
    picker.classList.add('hidden');
    workbench.classList.remove('hidden');
    $('#workbench-title').textContent = (scene.icon ? scene.icon + ' ' : '') + scene.title;
    addBubble('assistant', '我们开始「' + scene.title + '」。一次一个问题，用大白话答就行。');
    speak('我们开始' + scene.title + '，一次一个问题，用大白话回答就行。');
    renderCard();
    nextQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function submitAnswer() {
    if (!state.scene || state.finished) return;
    const question = state.scene.questions[state.index];
    if (!question) return;
    let value = input.value.trim();
    if (!value) return;
    // 数字选择：回 1/2/3/4 等于选对应示例
    if (/^[1-9]$/.test(value) && state.choices.length >= Number(value)) {
      value = state.choices[Number(value) - 1];
    }
    state.answers[question.key] = value;
    addBubble('user', value);
    renderCard();
    nextQuestion();
  }

  function resetAll() {
    state.scene = null;
    state.index = -1;
    state.answers = {};
    state.finished = false;
    workbench.classList.add('hidden');
    picker.classList.remove('hidden');
    if (searchInput) searchInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  searchInput.addEventListener('input', () => renderPicker(searchInput.value));
  grid.addEventListener('click', (event) => {
    const card = event.target.closest('.scene-card');
    if (card) startScene(card.dataset.id);
  });
  sendButton.addEventListener('click', (event) => {
    event.preventDefault();
    submitAnswer();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
      submitAnswer();
    }
  });
  restartButton.addEventListener('click', () => {
    if (state.scene) startScene(state.scene.id);
  });
  switchButton.addEventListener('click', resetAll);
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(resultPre.textContent);
      copyButton.textContent = '已复制 ✓';
      setTimeout(() => { copyButton.textContent = '复制提示词'; }, 1600);
    } catch (error) {
      copyButton.textContent = '复制失败，请手动选择';
    }
  });

  renderPicker('');
})();
