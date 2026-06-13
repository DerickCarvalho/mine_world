const E = '/assets/textures/mc/entity/';

export const ENTITY_TEXTURE_MAP = Object.freeze({
    pig:      E + 'pig/pig.png',
    sheep:    E + 'sheep/sheep.png',
    cow:      E + 'cow/cow.png',
    chicken:  E + 'chicken.png',
    creeper:  E + 'creeper/creeper.png',
    zombie:   E + 'zombie/zombie.png',
    skeleton: E + 'skeleton/skeleton.png',
    spider:   E + 'spider/spider.png',
});

export function getEntityTexturePath(mobType) {
    return ENTITY_TEXTURE_MAP[mobType] || null;
}
