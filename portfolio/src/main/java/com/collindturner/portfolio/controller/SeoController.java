/*
 *******************************************************************************
 * Project: Portfolio Website
 *
 * Author: Collin Turner
 * =============================================================================
 * (c) Copyright 2025 CollinDTurner All rights reserved.
 *******************************************************************************
*/
package com.collindturner.portfolio.controller;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Duration;

import javax.imageio.ImageIO;

import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * Crawler-facing endpoints: robots.txt, sitemap.xml, and a generated
 * 1200x630 Open Graph card. All three use the live request host so they stay
 * correct across localhost / Cloud Run / a custom domain.
 */
@RestController
public class SeoController {

    private volatile byte[] ogPng;

    private static String base() {
        String url = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public String robots() {
        return "User-agent: *\nAllow: /\n\nSitemap: " + base() + "/sitemap.xml\n";
    }

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String sitemap() {
        String b = base();
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
             + "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n"
             + "  <url><loc>" + b + "/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n"
             + "  <url><loc>" + b + "/resume</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>\n"
             + "</urlset>\n";
    }

    @GetMapping(value = "/og.png", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> ogImage() throws IOException {
        byte[] png = ogPng;
        if (png == null) {
            synchronized (this) {
                if (ogPng == null) {
                    ogPng = render();
                }
                png = ogPng;
            }
        }
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofDays(7)).cachePublic())
                .body(png);
    }

    private static byte[] render() throws IOException {
        final int w = 1200;
        final int h = 630;
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);

        g.setColor(new Color(0x1e1f22));
        g.fillRect(0, 0, w, h);

        g.setColor(new Color(0x3574f0));
        g.fillRect(0, 0, 12, h);

        int[] dots = {0xff5f57, 0xfebc2e, 0x28c840};
        for (int i = 0; i < dots.length; i++) {
            g.setColor(new Color(dots[i]));
            g.fillOval(64 + i * 34, 62, 18, 18);
        }

        g.setColor(new Color(0xdfe1e5));
        g.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 92));
        g.drawString("Collin Turner", 62, 300);

        g.setColor(new Color(0x9da0a8));
        g.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 40));
        g.drawString("Senior Software & Application Engineer", 64, 368);

        g.setColor(new Color(0x6aab73));
        g.setFont(new Font(Font.MONOSPACED, Font.PLAIN, 30));
        g.drawString("~/portfolio  -  a Spring Boot app wearing an IDE", 64, 466);

        g.setColor(new Color(0x303236));
        g.fillRect(64, 520, w - 128, 2);
        g.setColor(new Color(0x6f737a));
        g.setFont(new Font(Font.MONOSPACED, Font.PLAIN, 26));
        g.drawString("github.com/cdturner7", 64, 566);

        g.dispose();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(img, "png", out);
        return out.toByteArray();
    }
}
