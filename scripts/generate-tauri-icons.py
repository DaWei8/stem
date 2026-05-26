import os
from PIL import Image

def generate_icons():
    src_path = 'frontend/public/icon.png'
    dest_dir = 'src-tauri/icons'
    
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
        
    img = Image.open(src_path)
    
    # 1. 32x32 PNG
    img.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(dest_dir, '32x32.png'))
    print("Generated 32x32.png")
    
    # 2. 128x128 PNG
    img.resize((128, 128), Image.Resampling.LANCZOS).save(os.path.join(dest_dir, '128x128.png'))
    print("Generated 128x128.png")
    
    # 3. 128x128@2x PNG (256x256)
    img.resize((256, 256), Image.Resampling.LANCZOS).save(os.path.join(dest_dir, '128x128@2x.png'))
    print("Generated 128x128@2x.png")
    
    # 4. ICO
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    img.save(os.path.join(dest_dir, 'icon.ico'), sizes=ico_sizes)
    print("Generated icon.ico")
    
    # 5. ICNS
    img.save(os.path.join(dest_dir, 'icon.icns'))
    print("Generated icon.icns")

if __name__ == '__main__':
    generate_icons()
