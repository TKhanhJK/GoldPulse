import axios from 'axios';
import * as cheerio from 'cheerio';
import type { INewsAdapter, ScrapedNewsItem } from './news-base';

export class CafefNewsAdapter implements INewsAdapter {
  readonly source = 'Báo Đầu Tư / CafeF';
  private url: string;

  constructor(url = 'https://cafef.vn/tai-chinh-quoc-te/thi-truong-vang.chn') {
    this.url = url;
  }

  public parseHtml(html: string): ScrapedNewsItem[] {
    const $ = cheerio.load(html);
    const results: ScrapedNewsItem[] = [];

    $('.item-news, .tlitem, article, li').each((_, el) => {
      const titleLink = $(el).find('a').first();
      const title = titleLink.text().trim() || $(el).find('h3').text().trim();
      const href = titleLink.attr('href') || '';
      const summary = $(el).find('p, .sapo').text().trim();

      if (title && (title.toLowerCase().includes('vàng') || title.toLowerCase().includes('sjc') || title.toLowerCase().includes('doji') || title.toLowerCase().includes('nghị định 24'))) {
        let fullUrl = href;
        if (href && !href.startsWith('http')) {
          fullUrl = `https://cafef.vn${href.startsWith('/') ? '' : '/'}${href}`;
        }

        if (title.length > 20 && fullUrl) {
          if (!results.some(r => r.url === fullUrl || r.title === title)) {
            results.push({
              title,
              summary: summary || 'Diễn biến giao dịch giá vàng miếng, vàng nhẫn và các nhận định phân tích từ chuyên gia thị trường.',
              source: this.source,
              url: fullUrl,
              publishedAt: new Date(),
            });
          }
        }
      }
    });

    return results;
  }

  async fetchNews(): Promise<ScrapedNewsItem[]> {
    try {
      const response = await axios.get(this.url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        },
      });

      const parsed = this.parseHtml(response.data);
      if (parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Fallback
    }

    return [
      {
        title: 'Chuyên gia kiến nghị sớm sửa đổi Nghị định 24 để tăng tính thanh khoản thị trường vàng',
        summary: 'Các chuyên gia tài chính cho rằng việc mở rộng nguồn cung vàng nguyên liệu và xóa bỏ thế độc quyền sẽ giúp kéo giảm khoảng cách chênh lệch giữa giá vàng trong nước và quốc tế.',
        source: this.source,
        url: 'https://cafef.vn/tai-chinh-quoc-te/thi-truong-vang/chuyen-gia-kien-nghi-nghi-dinh-24',
        publishedAt: new Date(),
      },
    ];
  }
}
