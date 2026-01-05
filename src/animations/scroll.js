import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initScrollAnimations() {
  // Dashboard tiles（Bento）进入动画
  const tiles = document.querySelectorAll('.tile')
  if (tiles.length) {
    tiles.forEach((tile) => {
      gsap.from(tile, {
        scrollTrigger: {
          trigger: tile,
          start: 'top 80%',
          once: true
        },
        y: 14,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      })
    })
  }

  // Section 标题与内容淡入上移
  const sections = document.querySelectorAll('.section')
  sections.forEach((section) => {
    const title = section.querySelector('.section__title')
    const desc = section.querySelector('.section__desc')
    const cards = section.querySelectorAll('.card, .timelineCard')

    gsap.from([title, desc].filter(Boolean), {
      scrollTrigger: {
        trigger: section,
        start: 'top 78%',
        once: true
      },
      y: 14,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.08
    })

    if (cards.length) {
      gsap.from(cards, {
        scrollTrigger: {
          trigger: section,
          start: 'top 72%',
          once: true
        },
        y: 16,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.08
      })
    }

    // 核心板块：额外强调 featured 主卡
    if (section.classList.contains('section--featured')) {
      const featured = section.querySelector('[data-anim="featured"]')
      if (featured) {
        gsap.from(featured, {
          scrollTrigger: {
            trigger: section,
            start: 'top 72%',
            once: true
          },
          y: 18,
          opacity: 0,
          duration: 0.9,
          ease: 'power2.out'
        })
      }
    }
  })

  // 分隔带轻微揭示
  document.querySelectorAll('.divider').forEach((divider) => {
    gsap.from(divider, {
      scrollTrigger: {
        trigger: divider,
        start: 'top 90%',
        once: true
      },
      scaleX: 0.92,
      opacity: 0,
      transformOrigin: 'left center',
      duration: 0.6,
      ease: 'power2.out'
    })
  })

  // ===== Research featured: scroll-driven reading (academic) =====
  const research = document.querySelector('#research')
  const paper = research?.querySelector('.paper')
  if (research && paper) {
    const featuredMain = research.querySelector('.featured__main')
    const steps = paper.querySelectorAll('.paperSection')
    const bar = paper.querySelector('.paperProgress__bar')
    const hint = paper.querySelector('.paperHint')
    const figures = paper.querySelectorAll('[data-anim="figure"]')

    // 阅读进度条（随滚动）
    if (bar) {
      gsap.to(bar, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: paper,
          start: 'top 25%',
          end: 'bottom 25%',
          scrub: true
        }
      })
    }

    // 提示语：进入后淡出
    if (hint) {
      gsap.to(hint, {
        opacity: 0,
        duration: 0.4,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: paper,
          start: 'top 25%',
          end: 'top 10%',
          scrub: true
        }
      })
    }

    // 逐段高亮 + 渐入（可读性更强）
    steps.forEach((step) => {
      gsap.from(step, {
        scrollTrigger: {
          trigger: step,
          start: 'top 78%',
          once: true
        },
        y: 10,
        opacity: 0,
        duration: 0.55,
        ease: 'power2.out'
      })

      ScrollTrigger.create({
        trigger: step,
        start: 'top 55%',
        end: 'bottom 55%',
        toggleClass: { targets: step, className: 'is-active' }
      })
    })

    // Figures：滚动揭示（更有趣，但不喧宾夺主）
    figures.forEach((fig) => {
      gsap.from(fig, {
        scrollTrigger: {
          trigger: fig,
          start: 'top 78%',
          once: true
        },
        y: 12,
        opacity: 0,
        scale: 0.985,
        duration: 0.6,
        ease: 'power2.out'
      })
    })

    // 桌面端轻 pin：让“论文卡”更像在翻阅
    ScrollTrigger.matchMedia({
      '(min-width: 861px)': () => {
        if (!featuredMain) return
        const extra = Math.max(700, steps.length * 220)
        ScrollTrigger.create({
          trigger: research,
          start: 'top 14%',
          end: () => `+=${extra}`,
          pin: featuredMain,
          pinSpacing: true
        })
      }
    })
  }

  // 科研时间线：滚动时高亮当前卡片
  const tlCards = document.querySelectorAll('.timelineCard')
  tlCards.forEach((card) => {
    ScrollTrigger.create({
      trigger: card,
      start: 'top 70%',
      end: 'bottom 40%',
      onToggle: (self) => {
        card.style.boxShadow = self.isActive ? '0 18px 40px rgba(43, 32, 24, 0.18)' : ''
        card.style.transform = self.isActive ? 'translateY(-2px)' : ''
      }
    })
  })
}


