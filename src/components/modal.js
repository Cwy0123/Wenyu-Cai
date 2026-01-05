export function ensureModal() {
  let modal = document.querySelector('#imgModal')
  if (modal) return modal

  modal = document.createElement('div')
  modal.id = 'imgModal'
  modal.className = 'modal'
  modal.innerHTML = `
    <div class="modal__backdrop" data-close="true" aria-hidden="true"></div>
    <div class="modal__panel" role="dialog" aria-modal="true" aria-label="图片预览">
      <button class="modal__close" type="button" aria-label="关闭" data-close="true">关闭</button>
      <img class="modal__img" alt="" />
      <div class="modal__caption"></div>
    </div>
  `
  document.body.appendChild(modal)

  const close = () => modal.classList.remove('modal--open')
  modal.addEventListener('click', (e) => {
    const target = e.target
    if (target instanceof HTMLElement && target.dataset.close === 'true') close()
  })
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close()
  })

  return modal
}

export function openModal({ src, alt, caption }) {
  const modal = ensureModal()
  const img = modal.querySelector('.modal__img')
  const cap = modal.querySelector('.modal__caption')
  if (img) {
    img.setAttribute('src', src)
    img.setAttribute('alt', alt || '')
  }
  if (cap) cap.textContent = caption || ''
  modal.classList.add('modal--open')
}


