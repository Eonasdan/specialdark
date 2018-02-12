!function (global) {
    // Skip iframes.
    try { if (global.self !== global.top) return; } catch (e) { return; }

    var html = document.documentElement;
    // Keeps track of the current toggle state.
    var isDark = true;

    // This should never be called by a content script outside of a listener. We
    // expose it to background.js through listeners, and trust background.js as
    // the dispatcher.
    function toggle() {
        var dark = document.getElementById('special-dark')
        if (dark) dark.disabled=isDark;
        isDark = !isDark;
    }

    // If the background script (i.e. dispatcher) says "toggle", toggle!
    chrome.runtime.onMessage.addListener(function (request, sender, response) {
        // Early exit if the message is invalid or coming from another content
        // script.
        if (!request || sender.tab) { return; }

        switch (request.type) {
            case 'com.eonasdan.dte__REMOVE_MEDIA_FILTERS':
                html.classList.add('dark-theme-everywhere-filters-off');
                break;
            case 'com.eonasdan.dte__TOGGLE':
                toggle();
                if (typeof response === 'function') {
                    response({ isDark: isDark, url: global.location.hostname });
                }
                break;
        }
    });

    // Let the background script know that we've loaded new content.
    chrome.runtime.sendMessage({ type: 'com.eonasdan.dte__READY' });

    // HACK(riley): To gain an advantage in the specificity wars (against RES,
    //              for example), add an ID to the <html> or <body> element if
    //              one doesn't already exist. It's not a perfect solution:
    //              - If <html> and <body> both have ids, no id is applied.
    //              - Triples the size of injected CSS, since each line needs a
    //                html#specificityHelper and body#specificityHelper variant.
    //
    //              I do, however, prefer it over some of the alternatives:
    //              - Multiple space-delimited ids aren't valid.
    //              - Lone classes don't provide a strong specificity gain.
    //              - xml:id no-longer matches CSS selectors _or_ getElementById.
    //              - Wrapping the children of <body> might lead to a mess of
    //                layout and script problems.
    //              - Toggling inline styles is a huge pain right now, and though
    //                it might be the right idea some day it's far beyond the
    //                scope of this project.
    var specificityHelper = 'dark-theme-everywhere-specificity-helper';
    html.classList.add(specificityHelper);

    var host = global.self.location.host;
    if (host === '') return;
    var cssToLoad = 'main.css';
	
	if (host.includes('zillow') || (host.includes('google.com/maps') || global.self.location.pathname.includes('maps'))) {
        cssToLoad = '';
    }
    else if (host.includes('facebook')) {
        cssToLoad = 'facebook.css';
    }
    else if (host.includes('stackoverflow') || host.includes('serverfault.com') || host.includes('superuser.com')
        || host.includes('stackapps.com') || host.includes('mathoverflow.net') || host.includes('askubuntu.com') 
        || host.includes('stackexchange.com')) {// host.match("^https?:\\/\\/((?!(www|area51|gaming)).*\\.)?stackexchange.com.*")) {
        cssToLoad = 'stackexchange.css';
    }
    else if (host.includes('youtube')) {
        cssToLoad = 'youtube.css';
    }
    else if (host.includes('github')) {
        cssToLoad = 'github.css';
    }
    else if (host.includes('inbox.google.com')) {
        cssToLoad = 'inbox.css';
    }
    else if (host.includes('amazon')) {
        cssToLoad = 'amazon.css';
    }
	else if (host.includes('twitter.com')) {
		cssToLoad = 'twitter.css';
	}

	if (cssToLoad !== '') {
		document.addEventListener('DOMContentLoaded', function () {
			var t = document.createElement("link");
			t.href = chrome.extension.getURL('styles/' + cssToLoad);
			t.id = 'special-dark';
			t.type = "text/css";
			t.rel = "stylesheet";
			t.disabled=!isDark; //sometimes toggle happens before we get here (excluded site)
			document.getElementsByTagName("head")[0].appendChild(t);
			
			var body = document.body;
			body.classList.add(specificityHelper);
			if (!html.id) html.id = specificityHelper;
			else if (!body.id) body.id = specificityHelper;
		});
    }
}(this);
