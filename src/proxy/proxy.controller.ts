import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import axios from 'axios';

@Controller('proxy')
export class ProxyController {
  @Get('proxy-image')
  async proxyImage(@Query('url') url: string, @Res() res: Response) {
    try {
      if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      // Fetch the image with proper headers to bypass referer blocking
      const response = await axios.get(url, {
        responseType: 'stream',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://www.newbalance.co.il/',
          Origin: 'https://www.newbalance.co.il',
          Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
          'Accept-Language': 'he-IL,he;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
        timeout: 10000,
      });

      // Set appropriate headers for the response
      res.set({
        'Content-Type': response.headers['content-type'] || 'image/jpeg',
        'Content-Length': response.headers['content-length'],
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      });

      // Pipe the image stream to the response
      response.data.pipe(res);
    } catch (error) {
      console.error('Error proxying image:', error.message);
      res.status(500).json({ error: 'Failed to proxy image' });
    }
  }
}
