export class ShareAPI {
    share({ title = '', text = '', url = window.location.href } = {}) {
        if (!navigator.share) {
            return Promise.reject(new Error('Web Share API not supported'));
        }
        return navigator.share({ title, text, url });
    }
    facebook(url = window.location.href) {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    x(url = window.location.href, text = '') {
        const shareUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

