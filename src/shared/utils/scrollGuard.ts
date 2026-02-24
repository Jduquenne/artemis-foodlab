let _scrolling = false;
let _timer: ReturnType<typeof setTimeout> | null = null;

export function markScrolling() {
    _scrolling = true;
    if (_timer) clearTimeout(_timer);
    _timer = setTimeout(() => { _scrolling = false; }, 150);
}

export function isScrollingActive() {
    return _scrolling;
}
