import './styles.css'
import { openModal } from './components/modal.js'
import { initScrollAnimations } from './animations/scroll.js'

const app = document.querySelector('#app')
if (!app) throw new Error('#app not found')

async function loadContent() {
  const res = await fetch(new URL('./content/content.json', import.meta.url))
  if (!res.ok) throw new Error(`Failed to load content.json: ${res.status}`)
  return await res.json()
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderLinks(links = []) {
  if (!Array.isArray(links) || links.length === 0) return ''
  return `
    <div class="actions" style="margin-top: 12px">
      ${links
        .map(
          (l) =>
            `<a class="btn" href="${escapeHtml(l.href)}" target="_blank" rel="noreferrer">${escapeHtml(l.label)}</a>`
        )
        .join('')}
    </div>
  `
}

function renderTagList(items = []) {
  if (!Array.isArray(items) || items.length === 0) return ''
  return `<ul class="tags">${items.map((t) => `<li class="tag">${escapeHtml(t)}</li>`).join('')}</ul>`
}

function renderCardList(containerId, items) {
  const el = document.querySelector(containerId)
  if (!el) return
  if (!Array.isArray(items) || items.length === 0) {
    el.innerHTML = `<article class="card"><h3 class="card__title">暂无内容</h3><p class="card__meta">后续可在 src/content/content.json 中补充。</p></article>`
    return
  }
  el.innerHTML = items
    .map((it) => {
      const highlights = Array.isArray(it.highlights) ? it.highlights : []
      const outputs = Array.isArray(it.outputs) ? it.outputs : []
      return `
        <article class="card">
          <h3 class="card__title">${escapeHtml(it.title ?? '')}</h3>
          <p class="card__meta">${escapeHtml(it.meta ?? '')}</p>
          ${
            it.desc
              ? `<p class="card__meta" style="margin-top: 10px">${escapeHtml(it.desc)}</p>`
              : ''
          }
          ${
            highlights.length
              ? `<ul class="tags" style="margin-top: 12px">${highlights
                  .map((h) => `<li class="tag">${escapeHtml(h)}</li>`)
                  .join('')}</ul>`
              : ''
          }
          ${
            outputs.length
              ? `<ul class="tags" style="margin-top: 12px">${outputs
                  .map((o) => `<li class="tag">${escapeHtml(o)}</li>`)
                  .join('')}</ul>`
              : ''
          }
          ${renderLinks(it.links)}
        </article>
      `
    })
    .join('')
}

function renderTimeline(containerId, items) {
  const el = document.querySelector(containerId)
  if (!el) return
  if (!Array.isArray(items) || items.length === 0) {
    el.innerHTML = `<article class="card"><h3 class="card__title">暂无内容</h3><p class="card__meta">后续可在 src/content/content.json 中补充。</p></article>`
    return
  }
  el.innerHTML = `
    <div class="timeline">
      ${items
        .map((it) => {
          const outputs = Array.isArray(it.outputs) ? it.outputs : []
          return `
            <div class="timelineItem">
              <span class="timelineDot" aria-hidden="true"></span>
              <article class="timelineCard">
                <h3 class="card__title">${escapeHtml(it.title ?? '')}</h3>
                <p class="card__meta">${escapeHtml(it.meta ?? '')}</p>
                ${
                  it.desc
                    ? `<p class="card__meta" style="margin-top: 10px">${escapeHtml(it.desc)}</p>`
                    : ''
                }
                ${
                  outputs.length
                    ? `<ul class="tags" style="margin-top: 12px">${outputs
                        .map((o) => `<li class="tag">${escapeHtml(o)}</li>`)
                        .join('')}</ul>`
                    : ''
                }
                ${renderLinks(it.links)}
              </article>
            </div>
          `
        })
        .join('')}
    </div>
  `
}

function renderGallery(containerId, items) {
  const el = document.querySelector(containerId)
  if (!el) return
  if (!Array.isArray(items) || items.length === 0) {
    el.innerHTML = `<article class="card"><h3 class="card__title">暂无图片</h3><p class="card__meta">把图片放到 public/assets 后，在 content.json 里填 image 路径。</p></article>`
    return
  }
  el.innerHTML = items
    .map(
      (it) => `
        <article class="card">
          <h3 class="card__title">${escapeHtml(it.title ?? '')}</h3>
          <p class="card__meta">${escapeHtml(it.meta ?? '')}</p>
          ${
            it.image
              ? `<div style="margin-top: 12px">
                   <button class="imgBtn" type="button"
                     data-img="${escapeHtml(it.image)}"
                     data-alt="${escapeHtml(it.title ?? '作品')}"
                     data-caption="${escapeHtml(it.meta ?? '')}">
                     <img src="${escapeHtml(it.image)}" alt="${escapeHtml(it.title ?? '作品')}" loading="lazy" style="width:100%; height: 220px; object-fit: cover; border-radius: 14px; border: 1px solid var(--border);" />
                   </button>
                 </div>`
              : ''
          }
        </article>
      `
    )
    .join('')
}

function getLayout() {
  const layout = new URLSearchParams(window.location.search).get('layout')
  return layout === 'classic' ? 'classic' : 'dashboard'
}

function getPage() {
  const page = new URLSearchParams(window.location.search).get('page')
  if (!page) return null
  const ok = new Set(['research', 'ai', 'pm', 'content', 'visual'])
  return ok.has(page) ? page : null
}

function hrefWithLayout(layout) {
  const url = new URL(window.location.href)
  url.searchParams.set('layout', layout)
  return url.pathname + url.search + url.hash
}

function hrefWithPage(page) {
  const url = new URL(window.location.href)
  url.searchParams.set('layout', 'dashboard')
  url.searchParams.set('page', page)
  url.hash = ''
  return url.pathname + url.search + url.hash
}

function hrefDashboardHome() {
  const url = new URL(window.location.href)
  url.searchParams.set('layout', 'dashboard')
  url.searchParams.delete('page')
  url.hash = '#dashboard'
  return url.pathname + url.search + url.hash
}

function sparklineSvg(points = []) {
  const w = 220
  const h = 56
  if (!Array.isArray(points) || points.length < 2) return ''
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = Math.max(1e-6, max - min)
  const step = w / (points.length - 1)
  const d = points
    .map((v, i) => {
      const x = i * step
      const y = h - ((v - min) / span) * (h - 8) - 4
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
  return `
    <svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
      <path class="spark__line" d="${d}" />
    </svg>
  `
}

function templateNav(layout) {
  const page = getPage()
  return `
    <header class="nav" id="siteNav">
      <div class="nav__inner container">
        <a class="brand" href="#top" aria-label="返回顶部">
          <span class="brand__mark" aria-hidden="true"></span>
          <span>我的作品集</span>
        </a>
        <nav class="nav__links" aria-label="页面导航">
          ${
            layout === 'classic'
              ? `<a href="#about">简介</a><a href="#research">研究与分析</a><a href="#visual">视觉</a>`
              : page
                ? `<a href="${hrefDashboardHome()}">能力盘</a><a href="${hrefWithPage('research')}">研究</a><a href="${hrefWithPage('visual')}">视觉</a>`
                : `<a href="#home">首页</a><a href="#dashboard">能力盘</a><a href="${hrefWithPage('research')}">研究</a><a href="${hrefWithPage('visual')}">视觉</a>`
          }
        </nav>
        <div class="nav__mode">
          <a class="modeLink ${layout === 'dashboard' ? 'is-active' : ''}" href="${hrefWithLayout('dashboard')}">仪表盘</a>
          <a class="modeLink ${layout === 'classic' ? 'is-active' : ''}" href="${hrefWithLayout('classic')}">经典长页</a>
        </div>
        <button class="nav__toggle" id="navToggle" type="button" aria-expanded="false">
          菜单
        </button>
      </div>
    </header>
  `
}

function templateFooter() {
  return `
    <footer class="footer">
      <div class="container footer__inner">
        <span>© <span id="year"></span> 你的名字</span>
        <button class="toTop" type="button" id="toTop">返回顶部</button>
      </div>
    </footer>
  `
}

function templateResearchDeepDive() {
  return `
    <div class="divider divider--check" aria-hidden="true"></div>

    <section class="section section--featured container" id="research">
      <div class="section__head">
        <h2 class="section__title">研究与分析能力</h2>
        <p class="section__desc">核心板块：方法、案例、产出与结论表达。</p>
      </div>
      <div class="featured">
        <article class="featured__main" id="researchFeatured"></article>
        <aside class="featured__side">
          <div class="card" style="grid-column: span 12">
            <h3 class="card__title">常用方法</h3>
            <div id="researchMethods"></div>
          </div>
        </aside>
      </div>
      <div style="margin-top: 18px" id="researchTimeline"></div>
    </section>
  `
}

function templateVisualSection() {
  return `
    <div class="divider divider--check" aria-hidden="true"></div>

    <section class="section container" id="visual">
      <div class="section__head">
        <h2 class="section__title">视觉设计与创意表现</h2>
        <p class="section__desc">版式、配色、图形语言与细节。</p>
      </div>
      <div class="grid" id="visualGrid"></div>
    </section>
  `
}

function templateClassic() {
  return `
    <main>
      <section class="hero container" id="home">
        <div class="hero__wrap">
          <div class="hero__grid">
            <div>
              <h1 class="hero__title">你好，我是「你的名字」</h1>
              <p class="hero__subtitle">
                用研究与分析驱动决策，用 AI 工具提升效率，用设计与内容讲好故事。
              </p>
              <ul class="tags" aria-label="性格与关键词">
                <li class="tag">认真负责</li>
                <li class="tag">自驱学习</li>
                <li class="tag">表达清晰</li>
                <li class="tag">审美在线</li>
              </ul>
              <div class="actions">
                <a class="btn btn--primary" href="#research">先看核心能力</a>
                <a class="btn" href="#about">了解我</a>
              </div>
            </div>
            <div class="hero__art" role="img" aria-label="个人形象占位图">
              <div class="hero__artLabel">
                这里后续可以放：头像 / 一张代表性照片 / 或者你最自豪的作品封面
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="divider divider--check" aria-hidden="true"></div>

      <section class="section container" id="about">
        <div class="section__head">
          <h2 class="section__title">简介</h2>
          <p class="section__desc" id="aboutHeadline">静态内容：性格、优势、技能关键词、方向。</p>
        </div>
        <div class="grid">
          <article class="card">
            <h3 class="card__title">我是谁</h3>
            <p class="card__meta">一句话介绍 + 你最想被记住的能力/特质。</p>
          </article>
          <article class="card">
            <h3 class="card__title">我擅长什么</h3>
            <p class="card__meta">列 3-5 个关键词：研究能力/设计能力/表达能力/协作等。</p>
          </article>
        </div>
        <div style="margin-top: 14px" class="actions" id="contactLinks"></div>
      </section>

      ${templateResearchDeepDive()}

      <div class="divider divider--check" aria-hidden="true"></div>

      <section class="section container" id="ai">
        <div class="section__head">
          <h2 class="section__title">AI 工具应用与创新能力</h2>
          <p class="section__desc">把流程自动化，把表达产品化。</p>
        </div>
        <div class="grid" id="aiGrid"></div>
      </section>

      <div class="divider divider--check" aria-hidden="true"></div>

      <section class="section container" id="pm">
        <div class="section__head">
          <h2 class="section__title">项目管理与执行力</h2>
          <p class="section__desc">目标拆解、推进节奏、风险控制与复盘。</p>
        </div>
        <div class="grid" id="pmGrid"></div>
      </section>

      <div class="divider divider--check" aria-hidden="true"></div>

      <section class="section container" id="content">
        <div class="section__head">
          <h2 class="section__title">内容策划与品牌传播</h2>
          <p class="section__desc">受众、信息层级、传播路径与效果。</p>
        </div>
        <div class="grid" id="contentGrid"></div>
      </section>

      ${templateVisualSection()}
    </main>
  `
}

function templateDashboard() {
  return `
    <main>
      <section class="heroDash container" id="home">
        <div class="heroDash__wrap">
          <div class="heroDash__orbs" aria-hidden="true">
            <span class="orb orb--a"></span>
            <span class="orb orb--b"></span>
            <span class="orb orb--c"></span>
          </div>
          <div class="heroDash__grid">
            <div>
              <div class="heroDash__kicker">AI PRODUCT MANAGER & RESEARCHER</div>
              <h1 class="heroDash__title" id="heroSlogan">连接数据与创意的复合型构建者</h1>
              <p class="heroDash__subtitle" id="heroSloganEn">Bridging data & creativity</p>
              <p class="heroDash__bio" id="heroBio"></p>
              <div class="actions" id="heroCta"></div>
            </div>
            <div class="heroDash__portrait">
              <img id="heroPhoto" alt="个人形象" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section class="dashboard container" id="dashboard">
        <div class="section__head">
          <h2 class="section__title">能力概览盘</h2>
          <p class="section__desc">Bento Grid：把能力当作一个控制面板来呈现。</p>
        </div>

        <div class="bento" id="bento">
          <article class="tile tile--profile" id="tileProfile">
            <div class="tile__title">Profile</div>
            <div class="tile__body">
              <div class="tileProfile__name" id="tileName">你的名字</div>
              <div class="tileProfile__tags" id="tileTags"></div>
              <div class="tileProfile__links actions" id="tileLinks"></div>
            </div>
          </article>

          <article class="tile tile--research" id="tileResearch">
            <div class="tile__title">A. 研究与分析（核心）</div>
            <div class="tile__body">
              <div class="kpi">
                <div class="kpi__label" id="researchKpiLabel">案例结论</div>
                <div class="kpi__value" id="researchKpiValue">+18.6%</div>
                <div class="kpi__note" id="researchKpiNote">示例：关键指标提升</div>
              </div>
              <div class="sparkWrap" id="researchSpark"></div>
              <div class="actions">
                <a class="btn btn--primary" href="${hrefWithPage('research')}">查看详情</a>
                <a class="btn" href="${hrefWithPage('research')}#paper">快速导览</a>
              </div>
            </div>
          </article>

          <article class="tile tile--ai" id="tileAi">
            <div class="tile__title">B. AI 工具应用与创新</div>
            <div class="tile__body">
              <div class="aiHeadline" id="aiHeadline"></div>
              <div class="aiSub" id="aiSub"></div>
              <div class="aiBadges" id="aiBadges"></div>
              <div class="aiStrip" id="aiStrip" aria-hidden="true"></div>
              <div class="actions" style="margin-top: 12px">
                <a class="btn btn--primary" href="${hrefWithPage('ai')}">查看详情</a>
              </div>
            </div>
          </article>

          <article class="tile tile--pm" id="tilePm">
            <div class="tile__title">C. 项目管理与执行力</div>
            <div class="tile__body">
              <div id="pmBoard"></div>
              <div class="actions" style="margin-top: 12px">
                <a class="btn btn--primary" href="${hrefWithPage('pm')}">查看详情</a>
              </div>
            </div>
          </article>

          <article class="tile tile--visual" id="tileVisual">
            <div class="tile__title">D. 视觉设计（高卡片）</div>
            <div class="tile__body">
              <div class="coverStack" id="visualCovers"></div>
              <div class="actions">
                <a class="btn btn--primary" href="${hrefWithPage('visual')}">查看详情</a>
              </div>
            </div>
          </article>

          <article class="tile tile--content" id="tileContent">
            <div class="tile__title">E. 内容策划与品牌传播</div>
            <div class="tile__body">
              <div id="contentHeadlines"></div>
              <div class="actions" style="margin-top: 12px">
                <a class="btn btn--primary" href="${hrefWithPage('content')}">查看详情</a>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  `
}

function templatePageShell({ title, desc, bodyHtml }) {
  return `
    <main>
      <section class="page2 container" id="page2Top">
        <div class="page2__head">
          <a class="backBtn" href="${hrefDashboardHome()}">返回能力概览盘</a>
          <div>
            <h1 class="page2__title">${escapeHtml(title)}</h1>
            <p class="page2__desc">${escapeHtml(desc || '')}</p>
          </div>
        </div>
      </section>
      ${bodyHtml}
    </main>
  `
}

function templateSecondary(page) {
  if (page === 'research') {
    return templatePageShell({
      title: '研究与分析能力',
      desc: '论文式呈现：Abstract、Keywords、Figures、分段高亮与阅读进度。',
      bodyHtml: `
        <div id="paper"></div>
        ${templateResearchDeepDive()}
      `
    })
  }
  if (page === 'ai') {
    return templatePageShell({
      title: 'AI 工具应用与创新能力',
      desc: '展示结果与工作流：效率、产出、可复用模板。',
      bodyHtml: `
        <div class="divider divider--check" aria-hidden="true"></div>
        <section class="section container" id="ai">
          <div class="section__head">
            <h2 class="section__title">案例与工作流</h2>
            <p class="section__desc">用“结果”讲能力，而不仅是工具清单。</p>
          </div>
          <div class="grid" id="aiGrid"></div>
        </section>
      `
    })
  }
  if (page === 'pm') {
    return templatePageShell({
      title: '项目管理与执行力',
      desc: '用里程碑与交付成果证明推进能力。',
      bodyHtml: `
        <div class="divider divider--check" aria-hidden="true"></div>
        <section class="section container" id="pm">
          <div class="section__head">
            <h2 class="section__title">项目清单</h2>
            <p class="section__desc">目标拆解、节奏推进、风险应对与复盘。</p>
          </div>
          <div class="grid" id="pmGrid"></div>
        </section>
      `
    })
  }
  if (page === 'content') {
    return templatePageShell({
      title: '内容策划与品牌传播',
      desc: '把故事讲清楚，并让它传播。',
      bodyHtml: `
        <div class="divider divider--check" aria-hidden="true"></div>
        <section class="section container" id="content">
          <div class="section__head">
            <h2 class="section__title">代表内容</h2>
            <p class="section__desc">定位、结构、传播路径、效果与复盘。</p>
          </div>
          <div class="grid" id="contentGrid"></div>
        </section>
      `
    })
  }
  if (page === 'visual') {
    return templatePageShell({
      title: '视觉设计与创意表现',
      desc: '封面作品、排版与细节。',
      bodyHtml: templateVisualSection()
    })
  }
  return templateDashboard()
}

const layout = getLayout()
const page = getPage()

app.innerHTML = `
  <div class="page" id="top">
    ${templateNav(layout)}
    ${layout === 'classic' ? templateClassic() : page ? templateSecondary(page) : templateDashboard()}
    ${templateFooter()}
  </div>
`

// 移动端菜单展开/收起
const siteNav = document.querySelector('#siteNav')
const navToggle = document.querySelector('#navToggle')
if (siteNav && navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('nav--open')
    navToggle.setAttribute('aria-expanded', String(isOpen))
  })

  siteNav.addEventListener('click', (e) => {
    const target = e.target
    if (target instanceof HTMLAnchorElement) {
      siteNav.classList.remove('nav--open')
      navToggle.setAttribute('aria-expanded', 'false')
    }
  })
}

// 页脚年份 + 返回顶部
const yearEl = document.querySelector('#year')
if (yearEl) yearEl.textContent = String(new Date().getFullYear())

const toTop = document.querySelector('#toTop')
if (toTop) {
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

// 内容数据驱动渲染
loadContent()
  .then((data) => {
    const titleEl = document.querySelector('title')
    if (titleEl && data?.site?.title) titleEl.textContent = String(data.site.title)

    const brandName = document.querySelector('.brand span:last-child')
    if (brandName && data?.site?.title) brandName.textContent = String(data.site.title)

    const heroTitle = document.querySelector('.hero__title')
    if (heroTitle && data?.site?.name) {
      heroTitle.textContent = `你好，我是「${String(data.site.name)}」`
    }

    const heroSubtitle = document.querySelector('.hero__subtitle')
    if (heroSubtitle && data?.site?.tagline) heroSubtitle.textContent = String(data.site.tagline)

    const tagsEl = document.querySelector('.tags[aria-label="性格与关键词"]')
    if (tagsEl && Array.isArray(data?.site?.personalityTags)) {
      tagsEl.innerHTML = data.site.personalityTags.map((t) => `<li class="tag">${escapeHtml(t)}</li>`).join('')
    }

    // 简介补充一句话
    const aboutHeadline = document.querySelector('#aboutHeadline')
    if (aboutHeadline && data?.about?.headline) aboutHeadline.textContent = String(data.about.headline)

    // 联系方式放在简介区（按钮形式）
    const contactLinks = document.querySelector('#contactLinks')
    if (contactLinks && Array.isArray(data?.site?.contacts)) {
      contactLinks.innerHTML = data.site.contacts
        .map(
          (c) =>
            `<a class="btn" href="${escapeHtml(c.href)}" target="_blank" rel="noreferrer">${escapeHtml(c.label)}</a>`
        )
        .join('')
    }

    // About 两张卡
    const aboutCards = document.querySelectorAll('#about .grid .card')
    if (aboutCards.length >= 2 && Array.isArray(data?.about?.cards)) {
      for (let i = 0; i < Math.min(aboutCards.length, data.about.cards.length); i++) {
        const card = aboutCards[i]
        const t = card.querySelector('.card__title')
        const m = card.querySelector('.card__meta')
        if (t) t.textContent = String(data.about.cards[i].title ?? '')
        if (m) m.textContent = String(data.about.cards[i].text ?? '')
      }
    }

    // 能力板块渲染
    const caps = data?.capabilities
    if (caps) {
      // 研究与分析（核心）
      const featured = document.querySelector('#researchFeatured')
      if (featured && caps.research?.featured) {
        const f = caps.research.featured
        const h = Array.isArray(f.highlights) ? f.highlights : []
        const keywords = Array.isArray(f.keywords) ? f.keywords : []
        const sections = Array.isArray(f.sections) ? f.sections : []
        const figures = Array.isArray(f.figures) ? f.figures : []
        featured.innerHTML = `
          <div class="paper" data-anim="featured">
            <div class="paperProgress" aria-hidden="true">
              <span class="paperProgress__bar"></span>
            </div>
            <div class="paperHeader">
              <h3 class="featuredCard__title">${escapeHtml(f.title ?? '')}</h3>
              <p class="featuredCard__meta">${escapeHtml(f.meta ?? '')}</p>
              <div class="paperHint" aria-hidden="true">向下滚动阅读</div>
            </div>

            <section class="paperBlock paperBlock--abstract paperSection" data-paper-step="abstract">
              <h4 class="paperH">Abstract</h4>
              <p class="paperP">${escapeHtml(f.abstract ?? f.desc ?? '')}</p>
            </section>

            ${
              keywords.length
                ? `<section class="paperBlock paperBlock--keywords paperSection" data-paper-step="keywords">
                     <h4 class="paperH">Keywords</h4>
                     ${renderTagList(keywords)}
                   </section>`
                : ''
            }

            ${
              figures.length
                ? `<section class="paperBlock paperBlock--figures paperSection" data-paper-step="figures">
                     <h4 class="paperH">Figures</h4>
                     <div class="paperFigures">
                       ${figures
                         .map(
                           (fig) => `
                             <figure class="paperFigure" data-anim="figure">
                               <button class="imgBtn" type="button"
                                 data-img="${escapeHtml(fig.image ?? '')}"
                                 data-alt="${escapeHtml(fig.title ?? 'Figure')}"
                                 data-caption="${escapeHtml(fig.caption ?? '')}">
                                 <img src="${escapeHtml(fig.image ?? '')}" alt="${escapeHtml(fig.title ?? 'Figure')}" loading="lazy" />
                               </button>
                               <figcaption class="paperFigcap">
                                 <div class="paperFigTitle">${escapeHtml(fig.title ?? '')}</div>
                                 ${fig.caption ? `<div class="paperFigDesc">${escapeHtml(fig.caption)}</div>` : ''}
                               </figcaption>
                             </figure>
                           `
                         )
                         .join('')}
                     </div>
                   </section>`
                : ''
            }

            ${
              sections.length
                ? `<div class="paperBlocks">
                     ${sections
                       .map((s, idx) => {
                         const bullets = Array.isArray(s.bullets) ? s.bullets : []
                         return `
                           <section class="paperBlock paperSection" data-paper-step="${idx}">
                             <h4 class="paperH">${escapeHtml(s.heading ?? '')}</h4>
                             ${s.text ? `<p class="paperP">${escapeHtml(s.text)}</p>` : ''}
                             ${
                               bullets.length
                                 ? `<ul class="paperList">${bullets
                                     .map((b) => `<li>${escapeHtml(b)}</li>`)
                                     .join('')}</ul>`
                                 : ''
                             }
                           </section>
                         `
                       })
                       .join('')}
                   </div>`
                : h.length
                  ? `<section class="paperBlock paperSection" data-paper-step="highlights">
                       <h4 class="paperH">Key Points</h4>
                       ${renderTagList(h)}
                     </section>`
                  : ''
            }

            ${renderLinks(f.links)}
          </div>
        `
      }

      const methodsEl = document.querySelector('#researchMethods')
      if (methodsEl && Array.isArray(caps.research?.methods)) {
        methodsEl.innerHTML = renderTagList(caps.research.methods)
      }

      const timelineEl = document.querySelector('#researchTimeline')
      if (timelineEl) {
        timelineEl.innerHTML = `
          <div class="section__head" style="margin-top: 18px">
            <h3 class="section__title" style="font-size: 22px">研究项目与产出</h3>
            <p class="section__desc">更完整的过程与产出清单。</p>
          </div>
          <div class="grid" id="researchTimelineGrid"></div>
        `
        renderTimeline('#researchTimelineGrid', caps.research?.timeline)
      }

      // 其他能力：卡片
      renderCardList('#aiGrid', caps.ai?.cards)
      renderCardList('#pmGrid', caps.pm?.cards)
      renderCardList('#contentGrid', caps.content?.cards)

      // 视觉：画廊
      renderGallery('#visualGrid', caps.visual?.gallery)
    }

    // ===== Dashboard 绑定（仅 dashboard 模式存在）=====
    if (layout === 'dashboard') {
      const hero = data?.hero
      const heroSlogan = document.querySelector('#heroSlogan')
      if (heroSlogan && hero?.slogan) heroSlogan.textContent = String(hero.slogan)
      const heroSloganEn = document.querySelector('#heroSloganEn')
      if (heroSloganEn && hero?.sloganEn) heroSloganEn.textContent = String(hero.sloganEn)
      const heroBio = document.querySelector('#heroBio')
      if (heroBio && hero?.bio) heroBio.textContent = String(hero.bio)

      const heroPhoto = document.querySelector('#heroPhoto')
      if (heroPhoto instanceof HTMLImageElement) {
        heroPhoto.src = hero?.photo || '/assets/avatars/portrait-placeholder.svg'
      }

      const heroCta = document.querySelector('#heroCta')
      if (heroCta && Array.isArray(hero?.cta)) {
        heroCta.innerHTML = hero.cta
          .map((c, i) => {
            const cls = i === 0 ? 'btn btn--primary' : 'btn'
            return `<a class="${cls}" href="${escapeHtml(c.href)}">${escapeHtml(c.label)}</a>`
          })
          .join('')
      }

      const tileName = document.querySelector('#tileName')
      if (tileName && data?.site?.name) tileName.textContent = String(data.site.name)

      const tileTags = document.querySelector('#tileTags')
      if (tileTags && Array.isArray(data?.site?.personalityTags)) {
        tileTags.innerHTML = renderTagList(data.site.personalityTags)
      }

      const tileLinks = document.querySelector('#tileLinks')
      if (tileLinks && Array.isArray(data?.site?.contacts)) {
        tileLinks.innerHTML = data.site.contacts
          .map(
            (c) =>
              `<a class="btn" href="${escapeHtml(c.href)}" target="_blank" rel="noreferrer">${escapeHtml(c.label)}</a>`
          )
          .join('')
      }

      const dash = data?.dashboard
      if (dash?.research) {
        const kpiLabel = document.querySelector('#researchKpiLabel')
        const kpiValue = document.querySelector('#researchKpiValue')
        const kpiNote = document.querySelector('#researchKpiNote')
        if (kpiLabel) kpiLabel.textContent = String(dash.research.kpi?.label ?? '案例结论')
        if (kpiValue) kpiValue.textContent = String(dash.research.kpi?.value ?? '')
        if (kpiNote) kpiNote.textContent = String(dash.research.kpi?.note ?? '')
        const spark = document.querySelector('#researchSpark')
        if (spark) spark.innerHTML = sparklineSvg(dash.research.sparkline)
      }

      if (dash?.ai) {
        const el1 = document.querySelector('#aiHeadline')
        const el2 = document.querySelector('#aiSub')
        if (el1) el1.textContent = String(dash.ai.headline ?? '')
        if (el2) el2.textContent = String(dash.ai.sub ?? '')
        const badges = document.querySelector('#aiBadges')
        if (badges && Array.isArray(dash.ai.highlights)) badges.innerHTML = renderTagList(dash.ai.highlights)
        const strip = document.querySelector('#aiStrip')
        if (strip && Array.isArray(dash.ai.demoImages)) {
          strip.innerHTML = dash.ai.demoImages
            .map((src) => `<img src="${escapeHtml(src)}" alt="" loading="lazy" />`)
            .join('')
        }
      }

      if (dash?.pm) {
        const board = document.querySelector('#pmBoard')
        if (board && Array.isArray(dash.pm.projects)) {
          board.innerHTML = `
            <div class="pmBoard">
              ${dash.pm.projects
                .map(
                  (p) => `
                    <div class="pmItem">
                      <div class="pmItem__top">
                        <div class="pmItem__title">${escapeHtml(p.title ?? '')}</div>
                        <span class="pmPill pmPill--${escapeHtml(String(p.status ?? ''))}">${escapeHtml(p.status ?? '')}</span>
                      </div>
                      <div class="pmItem__meta">${escapeHtml(p.meta ?? '')}</div>
                    </div>
                  `
                )
                .join('')}
            </div>
          `
        }
      }

      if (dash?.content) {
        const list = document.querySelector('#contentHeadlines')
        if (list && Array.isArray(dash.content.headlines)) {
          list.innerHTML = `
            <div class="mag">
              ${dash.content.headlines
                .map(
                  (h) => `
                    <div class="magRow">
                      <div class="magTitle">${escapeHtml(h.title ?? '')}</div>
                      <div class="magMeta">${escapeHtml(h.meta ?? '')}</div>
                    </div>
                  `
                )
                .join('')}
            </div>
          `
        }
      }

      if (dash?.visual) {
        const covers = document.querySelector('#visualCovers')
        if (covers && Array.isArray(dash.visual.covers)) {
          covers.innerHTML = dash.visual.covers
            .slice(0, 3)
            .map(
              (src) => `
                <button class="imgBtn cover" type="button" data-img="${escapeHtml(src)}" data-alt="cover" data-caption="作品封面">
                  <img src="${escapeHtml(src)}" alt="cover" loading="lazy" />
                </button>
              `
            )
            .join('')
        }
      }
    }

    // 初始化滚动动效（确保内容已渲染）
    initScrollAnimations()
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.warn(err)
  })

// 画廊/证书：点击放大（事件委托）
document.addEventListener('click', (e) => {
  const target = e.target
  const btn = target instanceof HTMLElement ? target.closest('.imgBtn') : null
  if (!(btn instanceof HTMLButtonElement)) return
  const src = btn.dataset.img
  if (!src) return
  openModal({ src, alt: btn.dataset.alt, caption: btn.dataset.caption })
})
