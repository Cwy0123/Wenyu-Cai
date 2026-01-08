import './styles.css'
import { openModal } from './components/modal.js'
import { openDrawer } from './components/drawer.js'
import { initScrollAnimations } from './animations/scroll.js'

const app = document.querySelector('#app')
if (!app) throw new Error('#app not found')

const BASE_URL = import.meta.env.BASE_URL || '/'

function withBase(path) {
  if (!path) return ''
  const p = String(path)
  // keep absolute URLs / anchors / special schemes
  if (
    p.startsWith('http://') ||
    p.startsWith('https://') ||
    p.startsWith('#') ||
    p.startsWith('mailto:') ||
    p.startsWith('tel:')
  ) {
    return p
  }
  // allow users to write /assets/... in content.json; we will prefix BASE_URL
  const clean = p.replace(/^\/+/, '')
  return new URL(clean, window.location.origin + BASE_URL).toString()
}

function normalizeContactHref(href) {
  const h = String(href || '').trim()
  if (!h) return ''
  if (h.startsWith('http://') || h.startsWith('https://') || h.startsWith('mailto:') || h.startsWith('tel:'))
    return h
  if (h.includes('@')) return `mailto:${h}`
  // naive phone normalization: digits/+/spaces/- only
  if (/^[+\d][\d\s-]+$/.test(h)) return `tel:${h.replace(/\s+/g, '')}`
  return h
}

function isStaticContact(contact) {
  const label = String(contact?.label || '').trim()
  return label === '电话' || label === '邮箱'
}

function renderContacts(contacts = []) {
  if (!Array.isArray(contacts) || contacts.length === 0) return ''

  const staticOnes = contacts.filter((c) => isStaticContact(c))
  const linkOnes = contacts.filter((c) => !isStaticContact(c))

  const staticHtml = staticOnes.length
    ? `
      <div class="contactGrid">
        ${staticOnes
          .map(
            (c) => `
              <div class="miniCard">
                <div class="miniCard__label">${escapeHtml(c.label)}</div>
                <div class="miniCard__value">${escapeHtml(c.href)}</div>
              </div>
            `
          )
          .join('')}
      </div>
    `
    : ''

  const linkHtml = linkOnes.length
    ? `
      <div class="actions">
        ${linkOnes
          .map(
            (c) =>
              `<a class="btn" href="${escapeHtml(normalizeContactHref(c.href))}" target="_blank" rel="noreferrer">${escapeHtml(c.label)}</a>`
          )
          .join('')}
      </div>
    `
    : ''

  return staticHtml + linkHtml
}

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
            `<a class="btn" href="${escapeHtml(withBase(l.href))}" target="_blank" rel="noreferrer">${escapeHtml(l.label)}</a>`
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
                     data-img="${escapeHtml(withBase(it.image))}"
                     data-alt="${escapeHtml(it.title ?? '作品')}"
                     data-caption="${escapeHtml(it.meta ?? '')}">
                     <img src="${escapeHtml(withBase(it.image))}" alt="${escapeHtml(it.title ?? '作品')}" loading="lazy" style="width:100%; height: 220px; object-fit: cover; border-radius: 14px; border: 1px solid var(--border);" />
                   </button>
                 </div>`
              : ''
          }
        </article>
      `
    )
    .join('')
}

function getPage() {
  const page = new URLSearchParams(window.location.search).get('page')
  if (!page) return null
  const ok = new Set(['research', 'ai', 'pm', 'content', 'visual'])
  return ok.has(page) ? page : null
}

function hrefWithPage(page) {
  const url = new URL(window.location.href)
  url.searchParams.set('page', page)
  url.hash = ''
  return url.pathname + url.search + url.hash
}

function hrefDashboardHome() {
  const url = new URL(window.location.href)
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

// 饼状图渲染函数（甜甜圈样式）
function renderPieChart(config) {
  if (!config || !Array.isArray(config.slices)) return ''
  
  const slices = config.slices
  const total = slices.reduce((sum, s) => sum + s.value, 0)
  // 按图片配色：深褐 → 中褐 → 浅褐 → 米色 → 浅米
  const colors = ['#8b5a3c', '#a67c5b', '#c49a7a', '#d4b896', '#e8d4b8']
  const size = 200
  const cx = size / 2
  const cy = size / 2
  const outerR = 82
  const innerR = 32 // 内圆半径，形成甜甜圈（环宽1.25倍）
  
  // 简洁商务白色图标（SVG路径）
  const icons = {
    paper: `<path fill="#fff" d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM8 12h8v2H8v-2zm0 4h8v2H8v-2z"/>`,
    trophy: `<path fill="#fff" d="M5 3h14v2h-1v2a5 5 0 0 1-3 4.58V14a3 3 0 0 1-3 3h-1a3 3 0 0 1-3-3v-2.42A5 5 0 0 1 5 7V5H4V3h1zm2 2v2a3 3 0 0 0 2.18 2.88L10 10.12V14a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-3.88l.82-.24A3 3 0 0 0 16 7V5H7zM4 7H3a1 1 0 0 0 0 2h1V7zm16 0h1a1 1 0 0 1 0 2h-1V7zM8 19h8v2H8v-2z"/>`,
    book: `<path fill="#fff" d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6zm0 2h5v8l-2.5-1.5L6 12V4z"/>`,
    briefcase: `<path fill="#fff" d="M10 2a2 2 0 0 0-2 2v1H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4V4a2 2 0 0 0-2-2h-4zm0 2h4v1h-4V4zM4 7h16v4H4V7zm0 6h16v5H4v-5z"/>`,
    clipboard: `<path fill="#fff" d="M9 2a1 1 0 0 0-1 1H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2a1 1 0 0 0-1-1H9zm0 2h6v1H9V4zM6 5h2v1a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5h2v14H6V5zm2 5v2h8v-2H8zm0 4v2h5v-2H8z"/>`
  }
  const iconKeys = ['paper', 'trophy', 'book', 'briefcase', 'clipboard']
  
  let startAngle = -90
  const paths = slices.map((slice, i) => {
    const angle = (slice.value / total) * 360
    const endAngle = startAngle + angle
    const largeArc = angle > 180 ? 1 : 0
    
    // 外圆弧
    const ox1 = cx + outerR * Math.cos((startAngle * Math.PI) / 180)
    const oy1 = cy + outerR * Math.sin((startAngle * Math.PI) / 180)
    const ox2 = cx + outerR * Math.cos((endAngle * Math.PI) / 180)
    const oy2 = cy + outerR * Math.sin((endAngle * Math.PI) / 180)
    
    // 内圆弧（反方向）
    const ix1 = cx + innerR * Math.cos((endAngle * Math.PI) / 180)
    const iy1 = cy + innerR * Math.sin((endAngle * Math.PI) / 180)
    const ix2 = cx + innerR * Math.cos((startAngle * Math.PI) / 180)
    const iy2 = cy + innerR * Math.sin((startAngle * Math.PI) / 180)
    
    // 甜甜圈路径
    const path = `M ${ox1} ${oy1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${ox2} ${oy2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`
    
    // 图标位置（在环形中间）
    const midAngle = startAngle + angle / 2
    const iconR = (outerR + innerR) / 2
    const iconX = cx + iconR * Math.cos((midAngle * Math.PI) / 180)
    const iconY = cy + iconR * Math.sin((midAngle * Math.PI) / 180)
    
    startAngle = endAngle
    
    return { path, color: colors[i % colors.length], slice, iconX, iconY, iconKey: iconKeys[i % iconKeys.length] }
  })
  
  const svgPaths = paths.map((p, i) => `
    <g class="pieSlice" data-index="${i}">
      <path d="${p.path}" fill="${p.color}" class="pieSlice__path" />
      <g transform="translate(${p.iconX - 10}, ${p.iconY - 10}) scale(0.85)" class="pieSlice__iconG">
        <svg viewBox="0 0 24 24" width="20" height="20">${icons[p.iconKey]}</svg>
      </g>
    </g>
  `).join('')
  
  // 图例使用对应的小色块
  const legend = slices.map((s, i) => `
    <li class="pieLegend__item" data-index="${i}">
      <span class="pieLegend__dot" style="background:${colors[i % colors.length]}"></span>
      <span class="pieLegend__label">${escapeHtml(s.label)}：</span>
      <span class="pieLegend__value">${s.value}${escapeHtml(s.unit)}</span>
      ${s.note ? `<span class="pieLegend__note">（${escapeHtml(s.note)}）</span>` : ''}
    </li>
  `).join('')
  
  return `
    <div class="pieChart">
      <div class="pieChart__title">${escapeHtml(config.title || '')}</div>
      <div class="pieChart__body">
        <svg class="pieChart__svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          ${svgPaths}
        </svg>
        <ul class="pieLegend">${legend}</ul>
      </div>
    </div>
  `
}

function templateNav() {
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
            page
              ? `<a href="${hrefDashboardHome()}">能力盘</a><a href="${hrefWithPage('research')}">研究</a><a href="${hrefWithPage('visual')}">视觉</a>`
              : `<a href="#home">首页</a><a href="#dashboard">能力盘</a><a href="${hrefWithPage('research')}">研究</a><a href="${hrefWithPage('visual')}">视觉</a>`
          }
        </nav>
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
        <span>© <span id="year"></span> 能力标签</span>
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
        </div>

        <div class="bento" id="bento">
          <article class="tile tile--profile" id="tileProfile">
            <div class="tileProfile__name tileProfile__name--title" id="tileName">cwy的能量背包</div>
            <div class="tile__body">
              <div class="tileProfile__tags" id="tileTags"></div>
              <div class="tileProfile__links actions" id="tileLinks"></div>
            </div>
          </article>

          <article class="tile tile--research" id="tileResearch">
            <div class="tile__title">A. 研究与分析能力</div>
            <div class="tile__body tile__body--split">
              <div class="tile__left">
                <div class="researchStats" id="researchStats"></div>
                <div class="actions actions--bottom">
                  <a class="btn btn--primary" href="${hrefWithPage('research')}">查看详情</a>
                </div>
              </div>
              <div class="tile__right">
                <div class="pieChartWrap" id="pieChartWrap"></div>
              </div>
            </div>
          </article>

          <article class="tile tile--ai" id="tileAi">
            <div class="tile__title">B. AI工具应用与创新能力</div>
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
      desc: 'Bento Grid 模块化：置顶案例 2x2 + 项目卡片 + 功能卡片；点击卡片用侧边抽屉查看详情。',
      bodyHtml: `
        <section class="researchBentoWrap container">
          <div class="researchBento" id="researchBento"></div>
        </section>
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
      title: '组织规划与财务能力',
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

const page = getPage()

app.innerHTML = `
  <div class="page" id="top">
    ${templateNav()}
    ${page ? templateSecondary(page) : templateDashboard()}
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
      contactLinks.innerHTML = renderContacts(data.site.contacts)
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

    // ===== Dashboard 绑定（默认首页存在）=====
    {
      const hero = data?.hero
      const heroSlogan = document.querySelector('#heroSlogan')
      if (heroSlogan && hero?.slogan) heroSlogan.textContent = String(hero.slogan)
      const heroSloganEn = document.querySelector('#heroSloganEn')
      if (heroSloganEn && hero?.sloganEn) heroSloganEn.textContent = String(hero.sloganEn)
      const heroBio = document.querySelector('#heroBio')
      if (heroBio && hero?.bio) heroBio.textContent = String(hero.bio)

      const heroPhoto = document.querySelector('#heroPhoto')
      if (heroPhoto instanceof HTMLImageElement) {
        heroPhoto.src = withBase(hero?.photo || '/assets/avatars/portrait-placeholder.svg')
      }

      const heroCta = document.querySelector('#heroCta')
      if (heroCta && Array.isArray(hero?.cta)) {
        heroCta.innerHTML = hero.cta
          .map((c, i) => {
            const cls = i === 0 ? 'btn btn--primary' : 'btn'
            return `<a class="${cls}" href="${escapeHtml(withBase(c.href))}">${escapeHtml(c.label)}</a>`
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
        tileLinks.innerHTML = renderContacts(data.site.contacts)
      }

      const dash = data?.dashboard
      if (dash?.research) {
        // 渲染研究统计行
        const statsContainer = document.querySelector('#researchStats')
        if (statsContainer && Array.isArray(dash.research.statRows)) {
          statsContainer.innerHTML = dash.research.statRows.map(row => `
            <div class="researchStatRow">
              ${row.map((s, i) => `
                ${i > 0 ? '<span class="researchStat__sep">，</span>' : ''}
                <span class="researchStat">
                  <span class="researchStat__label">${escapeHtml(s.label)}</span><span class="researchStat__action">${escapeHtml(s.action)}</span>
                  <span class="researchStat__value">${escapeHtml(s.value)}</span><span class="researchStat__unit">${escapeHtml(s.unit)}</span>
                </span>
              `).join('')}
            </div>
          `).join('')
        }
        // 渲染饼状图
        const pieWrap = document.querySelector('#pieChartWrap')
        if (pieWrap && dash.research.pieChart) {
          pieWrap.innerHTML = renderPieChart(dash.research.pieChart)
          // 图例与扇区联动
          const legendItems = pieWrap.querySelectorAll('.pieLegend__item')
          const slices = pieWrap.querySelectorAll('.pieSlice')
          legendItems.forEach(item => {
            const idx = item.dataset.index
            item.addEventListener('mouseenter', () => {
              slices.forEach((s, i) => {
                if (String(i) === idx) {
                  s.classList.add('is-active')
                } else {
                  s.classList.add('is-dim')
                }
              })
            })
            item.addEventListener('mouseleave', () => {
              slices.forEach(s => {
                s.classList.remove('is-active', 'is-dim')
              })
            })
          })
        }
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
            .map((src) => `<img src="${escapeHtml(withBase(src))}" alt="" loading="lazy" />`)
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
                <button class="imgBtn cover" type="button" data-img="${escapeHtml(withBase(src))}" data-alt="cover" data-caption="作品封面">
                  <img src="${escapeHtml(withBase(src))}" alt="cover" loading="lazy" />
                </button>
              `
            )
            .join('')
        }
      }
    }

    // ===== Research secondary page (Bento + Drawer) =====
    const pageNow = getPage()
    if (pageNow === 'research') {
      const bento = document.querySelector('#researchBento')
      const r = caps?.research
      if (bento && r) {
        // 规则：只保留「超级卡 + 功能卡」，并且每个项目都拥有一组（不再有“置顶”特殊处理）
        const methods = Array.isArray(r.methods) ? r.methods : []
        const tools = Array.isArray(r.tools) ? r.tools : []

        // 用现有数据拼成项目列表：featured + timeline
        const featuredCase = r.featured
          ? {
              kind: 'featured',
              title: r.featured.title,
              meta: r.featured.meta,
              abstract: r.featured.abstract ?? r.featured.desc,
              keywords: r.featured.keywords,
              figures: r.featured.figures,
              sections: r.featured.sections,
              links: r.featured.links
            }
          : null

        const timelineCases = Array.isArray(r.timeline)
          ? r.timeline.map((p) => ({
              kind: 'timeline',
              title: p.title,
              meta: p.meta,
              year: p.year ?? (String(p.meta ?? '').match(/(20\\d{2})/)?.[1] ?? ''),
              metric: p.metric,
              desc: p.desc,
              outputs: p.outputs,
              links: p.links
            }))
          : []

        const cases = [featuredCase, ...timelineCases].filter(Boolean)

        const figPlaceholder = '/assets/research/figure-placeholder.svg'

        const caseBlocks = cases
          .map((c, idx) => {
            const abstract = String(c.abstract ?? c.desc ?? '')
            const absShort = abstract.length > 140 ? abstract.slice(0, 140) + '…' : abstract
            const fig0 =
              Array.isArray(c.figures) && c.figures[0]?.image
                ? c.figures[0].image
                : figPlaceholder

            const year = c.year ?? (String(c.meta ?? '').match(/(20\\d{2})/)?.[1] ?? '')
            const metric = c.metric ?? (c.kind === 'featured' ? '重点案例' : '研究项目')

            const superCard = `
              <article class="rTile rTile--super" data-drawer-kind="case" data-case-idx="${idx}">
                <div class="rSuper">
                  <div class="rSuper__fig">
                    <img src="${escapeHtml(withBase(fig0))}" alt="Figure" loading="lazy" />
                  </div>
                  <div class="rSuper__abs">
                    <div class="rTile__kicker">超级卡片</div>
                    <div class="rTile__title">${escapeHtml(c.title ?? '')}</div>
                    <div class="rTile__meta">${escapeHtml(c.meta ?? '')}</div>
                    <div class="rAbsP">${escapeHtml(absShort || '点击查看完整摘要与过程。')}</div>
                    <div class="actions">
                      <span class="btn btn--primary" style="pointer-events:none">点击展开详情</span>
                    </div>
                  </div>
                </div>
              </article>
            `

            const funcCard = `
              <article class="rTile rTile--funcTall" data-drawer-kind="case" data-case-idx="${idx}">
                <div class="rTile__inner">
                  <div class="rTile__kicker">功能卡</div>
                  <div class="rTile__title">${escapeHtml(year ? `${year}｜${metric}` : metric)}</div>
                  <div class="rTile__meta">方法</div>
                  <div>${renderTagList(methods)}</div>
                  <div class="rTile__meta" style="margin-top: 2px">工具</div>
                  <div>${renderTagList(tools)}</div>
                  <div class="rTile__meta">点击查看详情</div>
                </div>
              </article>
            `

            return `
              <section class="rGroup" aria-label="研究项目组">
                <div class="rGroup__grid">
                  ${superCard}
                  ${funcCard}
                </div>
              </section>
            `
          })
          .join('')

        bento.innerHTML = caseBlocks

        // 绑定 drawer 数据到 bento 元素，供点击时取用
        bento.dataset.drawer = JSON.stringify({ cases })
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

// Research Bento：点击卡片打开侧边抽屉（事件委托）
document.addEventListener('click', (e) => {
  const target = e.target
  const tile = target instanceof HTMLElement ? target.closest('.rTile') : null
  if (!(tile instanceof HTMLElement)) return

  const bento = tile.closest('#researchBento')
  if (!(bento instanceof HTMLElement)) return

  let payload
  try {
    payload = JSON.parse(bento.dataset.drawer || '{}')
  } catch {
    payload = {}
  }

  const kind = tile.dataset.drawerKind
  if (!kind) return

  const tagBlock = (title, items) =>
    `<div class="drawerBlock"><h3 class="drawerH">${escapeHtml(title)}</h3>${renderTagList(items)}</div>`

  if (kind === 'case') {
    const idx = Number(tile.dataset.caseIdx)
    const c = Array.isArray(payload.cases) ? payload.cases[idx] : null
    if (!c) return

    // featured 类型：走论文式详情；timeline 类型：走项目摘要+产出
    if (c.kind === 'featured') {
      const keywords = Array.isArray(c.keywords) ? c.keywords : []
      const figures = Array.isArray(c.figures) ? c.figures : []
      const sections = Array.isArray(c.sections) ? c.sections : []
      openDrawer({
        title: c.title || '研究案例',
        html: `
          <div class="drawerBlock">
            <h3 class="drawerH">${escapeHtml(c.title ?? '')}</h3>
            <p class="drawerP">${escapeHtml(c.meta ?? '')}</p>
          </div>
          <div class="drawerBlock">
            <h3 class="drawerH">Abstract</h3>
            <p class="drawerP">${escapeHtml(c.abstract ?? '')}</p>
          </div>
          ${keywords.length ? `<div class="drawerBlock"><h3 class="drawerH">Keywords</h3>${renderTagList(keywords)}</div>` : ''}
          ${
            figures.length
              ? `<div class="drawerBlock">
                   <h3 class="drawerH">Figures</h3>
                   ${figures
                     .map(
                       (fig) => `
                         <button class="imgBtn" type="button"
                           data-img="${escapeHtml(fig.image ?? '')}"
                           data-alt="${escapeHtml(fig.title ?? 'Figure')}"
                           data-caption="${escapeHtml(fig.caption ?? '')}">
                           <img src="${escapeHtml(fig.image ?? '')}" alt="${escapeHtml(fig.title ?? 'Figure')}" loading="lazy" style="width:100%; height: 220px; object-fit: contain; border-radius: 12px; border: 1px solid rgba(43,32,24,0.12); background: rgba(255,250,241,0.92)" />
                         </button>
                         <div class="drawerP" style="margin-top: 8px">${escapeHtml(fig.title ?? '')}</div>
                         <div class="drawerP" style="color: rgba(108,90,77,0.92)">${escapeHtml(fig.caption ?? '')}</div>
                       `
                     )
                     .join('')}
                 </div>`
              : ''
          }
          ${
            sections.length
              ? sections
                  .map((s) => {
                    const bullets = Array.isArray(s.bullets) ? s.bullets : []
                    return `
                      <div class="drawerBlock">
                        <h3 class="drawerH">${escapeHtml(s.heading ?? '')}</h3>
                        ${s.text ? `<p class="drawerP">${escapeHtml(s.text)}</p>` : ''}
                        ${bullets.length ? `<ul class="drawerList">${bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : ''}
                      </div>
                    `
                  })
                  .join('')
              : ''
          }
          ${renderLinks(c.links)}
        `
      })
      return
    }

    const outputs = Array.isArray(c.outputs) ? c.outputs : []
    openDrawer({
      title: c.title || '研究项目',
      html: `
        <div class="drawerBlock">
          <h3 class="drawerH">${escapeHtml(c.title ?? '')}</h3>
          <p class="drawerP">${escapeHtml(c.meta ?? '')}</p>
          ${c.metric ? `<p class="drawerP" style="margin-top: 6px"><strong>${escapeHtml(c.metric)}</strong></p>` : ''}
        </div>
        ${c.desc ? `<div class="drawerBlock"><h3 class="drawerH">摘要</h3><p class="drawerP">${escapeHtml(c.desc)}</p></div>` : ''}
        ${outputs.length ? `<div class="drawerBlock"><h3 class="drawerH">产出</h3>${renderTagList(outputs)}</div>` : ''}
        ${renderLinks(c.links)}
      `
    })
  }
})
