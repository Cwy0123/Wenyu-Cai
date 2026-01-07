export function ensureDrawer() {
  let drawer = document.querySelector('#sideDrawer')
  if (drawer) return drawer

  drawer = document.createElement('div')
  drawer.id = 'sideDrawer'
  drawer.className = 'drawer'
  drawer.innerHTML = `
    <div class="drawer__backdrop" data-close="true" aria-hidden="true"></div>
    <aside class="drawer__panel" role="dialog" aria-modal="true" aria-label="详情">
      <div class="drawer__top">
        <div class="drawer__title" id="drawerTitle">详情</div>
        <button class="drawer__close" type="button" aria-label="关闭" data-close="true">关闭</button>
      </div>
      <div class="drawer__content" id="drawerContent"></div>
    </aside>
  `
  document.body.appendChild(drawer)

  const close = () => drawer.classList.remove('drawer--open')
  drawer.addEventListener('click', (e) => {
    const target = e.target
    if (target instanceof HTMLElement && target.dataset.close === 'true') close()
  })
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close()
  })

  return drawer
}

export function openDrawer({ title, html }) {
  const drawer = ensureDrawer()
  const t = drawer.querySelector('#drawerTitle')
  const c = drawer.querySelector('#drawerContent')
  if (t) t.textContent = title || '详情'
  if (c) c.innerHTML = html || ''
  drawer.classList.add('drawer--open')
}



