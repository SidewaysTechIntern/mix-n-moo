import math
import os
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

os.makedirs('assets/images', exist_ok=True)

# 1. Extract real AI Green Bowl from cow_eating.jpg
cow_eating_path = 'assets/images/cow_eating.jpg'
if os.path.exists(cow_eating_path):
    img = Image.open(cow_eating_path)
    w, h = img.size
    # Bowl is in lower section: (left, top, right, bottom)
    crop_box = (int(w * 0.22), int(h * 0.65), int(w * 0.58), int(h * 0.88))
    bowl_crop = img.crop(crop_box)
    
    # Create circular transparency mask for the AI green ceramic bowl
    bw, bh = bowl_crop.size
    mask = Image.new('L', (bw, bh), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((4, 4, bw - 4, bh - 4), fill=255)
    
    bowl_png = Image.new('RGBA', (bw, bh), (0, 0, 0, 0))
    bowl_png.paste(bowl_crop, (0, 0), mask)
    bowl_png.save('assets/images/ai_green_bowl.png')
    print("Saved ai_green_bowl.png")

# 2. Extract real AI Pizza Plate & Kitchen BG from cow_sneaky_pizza.jpg
cow_pizza_path = 'assets/images/cow_sneaky_pizza.jpg'
if os.path.exists(cow_pizza_path):
    img = Image.open(cow_pizza_path)
    w, h = img.size
    
    # Background environment: top kitchen table
    bg_crop = img.resize((430, 750))
    # Soft background blur to make it a warm environment canvas
    bg_blur = bg_crop.filter(ImageFilter.GaussianBlur(radius=1.5))
    bg_blur.save('assets/images/ai_prep_bg.jpg', quality=95)
    print("Saved ai_prep_bg.jpg")
    
    # Extract Pizza Plate: lower right
    crop_box = (int(w * 0.48), int(h * 0.62), int(w * 0.95), int(h * 0.86))
    pizza_crop = img.crop(crop_box)
    pw, ph = pizza_crop.size
    mask = Image.new('L', (pw, ph), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((6, 6, pw - 6, ph - 6), fill=255)
    
    pizza_png = Image.new('RGBA', (pw, ph), (0, 0, 0, 0))
    pizza_png.paste(pizza_crop, (0, 0), mask)
    pizza_png.save('assets/images/ai_plate_pizza.png')
    print("Saved ai_plate_pizza.png")

# Helper function to generate high quality raster AI-styled bowl container PNGs
def create_ai_container_png(filename, ingredient_type):
    size = 200
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Outer Bowl Shadow
    shadow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.ellipse((16, 24, 184, 192), fill=(40, 25, 10, 80))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=8))
    img.paste(shadow, (0, 0), shadow)
    
    # AI White Ceramic Bowl Body
    draw.ellipse((15, 15, 185, 185), fill=(248, 244, 235, 255), outline=(160, 140, 115, 255), width=4)
    # Inner Rim Highlight
    draw.ellipse((22, 22, 178, 178), fill=(225, 212, 190, 255), outline=(185, 168, 140, 255), width=3)
    # Bowl Cavity
    draw.ellipse((28, 28, 172, 172), fill=(205, 190, 165, 255))
    
    # Draw Ingredient Contents
    if ingredient_type == 'maize':
        # Golden Corn Cob & Kernels
        draw.ellipse((45, 45, 155, 155), fill=(245, 190, 39, 255), outline=(180, 130, 10, 255), width=3)
        for x in range(55, 150, 16):
            for y in range(55, 150, 16):
                if (x-100)**2 + (y-100)**2 < 45**2:
                    draw.ellipse((x-6, y-6, x+6, y+6), fill=(255, 215, 60, 255), outline=(210, 155, 15, 255), width=2)
        # Husk leaves
        draw.polygon([(30, 100), (50, 40), (70, 80)], fill=(110, 170, 50, 255), outline=(50, 100, 20, 255))
        draw.polygon([(170, 100), (150, 40), (130, 80)], fill=(120, 180, 55, 255), outline=(50, 100, 20, 255))
        
    elif ingredient_type == 'cowpea':
        # Green Pea Spheres
        positions = [
            (100, 70), (75, 80), (125, 80), (60, 105), (100, 105), (140, 105),
            (75, 130), (125, 130), (100, 135), (90, 95), (110, 95), (100, 115)
        ]
        for px, py in positions:
            r = 16
            draw.ellipse((px-r, py-r, px+r, py+r), fill=(100, 185, 45, 255), outline=(40, 95, 15, 255), width=2)
            draw.ellipse((px-r+4, py-r+4, px-r+9, py-r+9), fill=(175, 235, 120, 255))
            
    elif ingredient_type == 'hay':
        # Golden Shredded Hay
        draw.ellipse((40, 40, 160, 160), fill=(225, 175, 50, 255))
        for i in range(40):
            x1 = 50 + (i * 7) % 100
            y1 = 45 + (i * 11) % 100
            x2 = x1 + (i % 5 - 2) * 15
            y2 = y1 + 35
            draw.line([(x1, y1), (x2, y2)], fill=(255, 220, 100, 255), width=4)
            draw.line([(x1+2, y1-2), (x2+2, y2-2)], fill=(185, 130, 20, 255), width=2)
            
    elif ingredient_type == 'water':
        # Blue Glass Pitcher
        draw.ellipse((15, 15, 185, 185), fill=(230, 245, 255, 0)) # Clear background
        # Pitcher Jug
        draw.polygon([(65, 30), (135, 30), (150, 150), (50, 150)], fill=(155, 215, 250, 220), outline=(40, 130, 200, 255), width=4)
        # Handle
        draw.arc((120, 45, 175, 135), start=270, end=90, fill=(40, 130, 200, 255), width=8)
        # Liquid Water Inside
        draw.ellipse((52, 70, 148, 148), fill=(70, 165, 230, 230), outline=(30, 110, 180, 255), width=3)
        draw.ellipse((58, 70, 142, 90), fill=(140, 215, 255, 230))
        
    elif ingredient_type == 'minerals':
        # Dark Mineral Pellet Spheres
        positions = [
            (100, 65), (70, 80), (130, 80), (55, 110), (100, 105), (145, 110),
            (70, 135), (130, 135), (100, 140), (85, 95), (115, 95), (100, 120)
        ]
        for px, py in positions:
            r = 16
            draw.ellipse((px-r, py-r, px+r, py+r), fill=(55, 50, 46, 255), outline=(15, 12, 10, 255), width=2)
            draw.ellipse((px-r+4, py-r+4, px-r+8, py-r+8), fill=(120, 115, 110, 255))
            
    elif ingredient_type == 'azolla':
        # Fresh Green Rosette Azolla
        draw.ellipse((40, 40, 160, 160), fill=(60, 140, 30, 255))
        for r in range(40, 10, -8):
            for a in range(0, 360, 45):
                rad = math.radians(a)
                cx = 100 + int(r * math.cos(rad))
                cy = 100 + int(r * math.sin(rad))
                draw.ellipse((cx-12, cy-12, cx+12, cy+12), fill=(100, 195, 55, 255), outline=(35, 95, 15, 255), width=2)
        draw.ellipse((90, 90, 110, 110), fill=(150, 230, 90, 255))

    img.save(filename)
    print(f"Saved {filename}")

create_ai_container_png('assets/images/ai_bowl_maize.png', 'maize')
create_ai_container_png('assets/images/ai_bowl_cowpea.png', 'cowpea')
create_ai_container_png('assets/images/ai_bowl_hay.png', 'hay')
create_ai_container_png('assets/images/ai_pitcher_water.png', 'water')
create_ai_container_png('assets/images/ai_bowl_minerals.png', 'minerals')
create_ai_container_png('assets/images/ai_bowl_azolla.png', 'azolla')

print("All AI PNG raster assets successfully created!")
