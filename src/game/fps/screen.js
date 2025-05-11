import { SpriteMaterial, Sprite } from 'three';
import { Screen } from './settings';

export const createSight = (texture) => {
  const material = new SpriteMaterial({
    color: 0xffffff,
    map: texture.get('sight'),
  });

  const sprite = new Sprite(material);
  sprite.scale.set(Screen.sightSize, Screen.sightSize, 0);
  sprite.position.set(0, 0, -10);

  return sprite;
};

export const sightLines = (texture) => {
  const material = new SpriteMaterial({
    color: Screen.sightLinesColor,
    map: texture.get('sightLines'),
  });

  const sprite = new Sprite(material);
  sprite.scale.set(Screen.sightLinesSize, Screen.sightLinesSize, 0);
  sprite.position.set(0, 0, -10);

  return sprite;
};

export const createVerticalFrame = (texture) => {
  const material = new SpriteMaterial({
    color: Screen.verticalFrameColor,
    map: texture.get('verticalFrame'),
    transparent: true,
    opacity: 0.3,
  });

  const sprite = new Sprite(material);
  sprite.scale.set(Screen.verticalFrameSize, Screen.verticalFrameSize, 0);
  sprite.position.set(0, 0, -10);

  return sprite;
};

export const createCenterMark = (texture) => {
  const material = new SpriteMaterial({
    color: Screen.centerMarkColor,
    map: texture.get('centerMark'),
    transparent: true,
    opacity: 0.5,
  });

  const sprite = new Sprite(material);
  sprite.scale.set(Screen.centerMarkSize, Screen.centerMarkSize, 0);
  sprite.position.setZ(-20);

  return sprite;
};

export const createPovIndicator = (texture) => {
  const sprite = {};

  const material = {};
  /* material.vertical = new SpriteMaterial({
    color: 0xffffff,
    map: texture.get('verticalIndicator'),
  }); */
  material.vertical = new SpriteMaterial({
    color: 0xffffff,
    map: texture.get('verticalIndicator'),
  });
  material.direction = new SpriteMaterial({
    color: 0xffffff,
    map: texture.get('directionIndicator'),
  });

  sprite.vertical = new Sprite(material.vertical);
  sprite.vertical.visible = false;
  sprite.vertical.scale.set(Screen.sightPovSize, Screen.sightPovSize, 0);
  sprite.vertical.position.setZ(-10);

  sprite.horizontal = new Sprite(material.direction);
  sprite.horizontal.visible = false;
  sprite.horizontal.scale.set(
    Screen.horizontalIndicatorSize,
    Screen.horizontalIndicatorSize,
    0,
  );
  sprite.horizontal.position.setZ(-10);

  return sprite;
};
