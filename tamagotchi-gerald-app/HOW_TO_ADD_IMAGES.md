# How to Add Your Own Images to Gerald Tamagotchi

## 📁 Where to Place Images

All images should be placed in: `public/images/`

## 🖼️ Required Images

### 1. Gerald (Main Character)
- **Filename**: `gerald.png` (or .jpg, .gif, .webp)
- **Recommended size**: 200x200 pixels
- **Description**: This is your main Tamagotchi character

### 2. Decorations (8 items)
Place these decoration images in the `public/images/` folder:

- `flower-pink.png` - Pink Flower 🌸
- `flower-sun.png` - Sunflower 🌻
- `mushroom.png` - Mushroom 🍄
- `butterfly.png` - Butterfly 🦋
- `rainbow.png` - Rainbow 🌈
- `star.png` - Star ⭐
- `moon.png` - Moon 🌙
- `bee.png` - Bee 🐝

**Recommended size**: 100x100 to 300x300 pixels

### 3. Gacha Button
- **Filename**: `gacha-button.png`
- **Recommended size**: 200x200 pixels
- **Description**: The gacha machine button in the top right

## 🎨 Tips for Best Results

1. **Use transparent backgrounds** (PNG format) for decorations and Gerald
2. **Square images work best** (same width and height)
3. **Keep file sizes small** (< 500KB each) for faster loading
4. **Use descriptive names** matching the ones listed above

## 🔄 Fallback Behavior

If an image file is not found, the app will automatically fall back to using emoji:
- Gerald: 🌱
- Gacha: 🎰
- Decorations: Their respective emoji

## 📝 Example File Structure

```
tamagotchi-gerald-app/
├── public/
│   ├── images/
│   │   ├── gerald.png          ← Your Gerald image
│   │   ├── gacha-button.png    ← Your gacha machine
│   │   ├── flower-pink.png     ← Decoration 1
│   │   ├── flower-sun.png      ← Decoration 2
│   │   ├── mushroom.png        ← Decoration 3
│   │   ├── butterfly.png       ← Decoration 4
│   │   ├── rainbow.png         ← Decoration 5
│   │   ├── star.png            ← Decoration 6
│   │   ├── moon.png            ← Decoration 7
│   │   └── bee.png             ← Decoration 8
│   └── vite.svg
└── src/
```

## 🚀 Quick Start

1. Find or create your images
2. Rename them according to the list above
3. Place them in `public/images/` folder
4. Refresh your browser (Ctrl+R or Cmd+R)
5. Your images will appear in the game!

## 🎨 Where to Get Images

- **Free image sites**: Unsplash, Pexels, Pixabay
- **Draw your own**: Use any drawing app
- **AI Generated**: Use DALL-E, Midjourney, or Stable Diffusion
- **Game sprites**: OpenGameArt.org, itch.io

Enjoy customizing your Gerald Tamagotchi! 🌱
