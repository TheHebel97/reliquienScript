export function cloneRelicDetails(details: HTMLElement): HTMLElement {
  const clone = details.cloneNode(true) as HTMLElement;
  const nativeStats = details.querySelectorAll<HTMLElement>('.sub_stat');
  clone.querySelectorAll<HTMLElement>('.sub_stat').forEach((stat, i) => {
    if (nativeStats[i]) stat.style.color = getComputedStyle(nativeStats[i]).color;
  });
  clone.querySelectorAll('.buttons, script, iframe').forEach(node => node.remove());
  [clone, ...Array.from(clone.querySelectorAll<HTMLElement>('*'))].forEach(node => {
    node.removeAttribute('id'); node.removeAttribute('tabindex');
    if (node.tagName === 'A') node.removeAttribute('href');
    Array.from(node.attributes).filter(attribute => attribute.name.startsWith('on'))
      .forEach(attribute => node.removeAttribute(attribute.name));
  });
  return clone;
}

export function isRelicActionDisabled(button: HTMLButtonElement): boolean {
  return button.disabled || button.classList.contains('btn-disabled');
}
