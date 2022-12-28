const staticCache = "static";
const miscRes = [
    "./",
    "./index.html",
    "./video/game-demo1.mp4" ,
];
const jsRes = [
    "./js/background.js",
    "./js/collisionAnimation.js",
    "./js/enemies.js",
    "./js/floatingMessages.js",
    "./js/input.js",
    "./js/items.js",
    "./js/level-states.js",
    "./js/levels.js",
    "./js/main.js",
    "./js/particles.js",
    "./js/player.js",
    "./js/playerStates.js",
    "./js/ui.js",
];
const assetsRes = [
    "./assets/sd.png",
    "./assets/player.png",
    "./assets/layer-1.png",
    "./assets/layer-2.png",
    "./assets/layer-3.png",
    "./assets/layer-4.png",
    "./assets/layer-5.png",
    "./assets/enemy_fly.png",
    "./assets/enemy_plant.png",
    "./assets/enemy_spider_big.png",
    "./assets/line01.png",
    "./assets/fire.png",
    "./assets/boom.png",
    "./assets/item_flame.png",
];
const staticRessources = miscRes.concat(jsRes, assetsRes);


self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(staticCache).then(cache => {
            return cache.addAll(staticRessources);
        })
    );
    console.log("Service Worker installed!");
});


self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== staticCache)
                .map(key => caches.delete())
                )
        })
    );
    console.log("Service Worker activated!");
});


self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(resp => {
            return resp || fetch(e.request);
        })
    )
});