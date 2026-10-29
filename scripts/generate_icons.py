import struct
import zlib
import os

def create_png(width, height, primary_color, gold_color, accent_color, output_path):
    # RGBA values
    bg_r, bg_g, bg_b = primary_color
    gold_r, gold_g, gold_b = gold_color
    acc_r, acc_g, acc_b = accent_color

    raw_data = bytearray()
    
    # Simple icon drawing in pure python
    cx, cy = width // 2, height // 2
    r_outer = int(width * 0.44)
    r_inner = int(width * 0.38)

    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        for x in range(width):
            dx = x - cx
            dy = y - cy
            dist_sq = dx * dx + dy * dy

            # Default transparent or background
            if dist_sq <= r_outer * r_outer:
                # Inside outer circle
                # Cap triangle (top half)
                # y between cy - r_outer*0.6 and cy
                rel_y = y - (cy - int(height * 0.15))
                rel_x = abs(x - cx)
                
                # Graduation cap diamond shape
                is_cap = False
                if -int(height*0.25) <= dy <= int(height*0.1) and rel_x * 0.6 + abs(dy + int(height*0.08)) * 1.0 < int(width*0.28):
                    is_cap = True

                # Verified badge in bottom right
                v_cx, v_cy = cx + int(width * 0.25), cy + int(height * 0.25)
                v_dx, v_dy = x - v_cx, y - v_cy
                is_badge = (v_dx * v_dx + v_dy * v_dy) <= (int(width * 0.12) ** 2)
                is_badge_border = (v_dx * v_dx + v_dy * v_dy) <= (int(width * 0.14) ** 2)

                if is_badge:
                    raw_data.extend([acc_r, acc_g, acc_b, 255])
                elif is_badge_border:
                    raw_data.extend([255, 255, 255, 255])
                elif is_cap:
                    raw_data.extend([gold_r, gold_g, gold_b, 255])
                else:
                    raw_data.extend([bg_r, bg_g, bg_b, 255])
            else:
                raw_data.extend([bg_r, bg_g, bg_b, 255])

    # PNG chunks
    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(c) & 0xffffffff)
        return struct.pack('>I', len(data)) + c + crc

    png = bytearray(b'\x89PNG\r\n\x1a\n')
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png.extend(chunk(b'IHDR', ihdr_data))
    # IDAT
    compressed = zlib.compress(bytes(raw_data), 9)
    png.extend(chunk(b'IDAT', compressed))
    # IEND
    png.extend(chunk(b'IEND', b''))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'wb') as f:
        f.write(png)
    print(f"Created {output_path} ({width}x{height})")

if __name__ == '__main__':
    # Sapphire #0F294A = (15, 41, 74)
    # Gold #FEA619 = (254, 166, 25)
    # Emerald #00A472 = (0, 164, 114)
    create_png(192, 192, (15, 41, 74), (254, 166, 25), (0, 164, 114), '/public/pwa-192x192.png')
    create_png(512, 512, (15, 41, 74), (254, 166, 25), (0, 164, 114), '/public/pwa-512x512.png')
    create_png(512, 512, (15, 41, 74), (254, 166, 25), (0, 164, 114), '/public/pwa-maskable-512x512.png')
    create_png(180, 180, (15, 41, 74), (254, 166, 25), (0, 164, 114), '/public/apple-touch-icon.png')
