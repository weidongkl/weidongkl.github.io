import React from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

export default function About() {
  return (
    <Layout title="关于我" description="About the Author">
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '3rem', 
          alignItems: 'start',
          minHeight: '500px'
        }}>
          {/* 左侧文字内容 */}
          <div>
            <Heading as="h1">About the Author</Heading>
            
            <p>
              Hi, I'm <strong>Weidong (魏东)</strong> — a passionate software developer focusing on Golang, Linux (especially Red Hat), performance optimization, and open-source contributions like <em>openEuler</em>.
            </p>
            
            <p>
              This site is a digital notebook — recording study notes, technical insights, and thoughts on books and projects.
            </p>
            
            <blockquote>
              <strong>"悟已往之不谏，知来者之可追。"</strong>
            </blockquote>
            
            <ul>
              <li><strong>GitHub</strong>: <a href="https://github.com/weidongkl" target="_blank" rel="noopener noreferrer">weidongkl</a></li>
              <li><strong>Gitee</strong>: <a href="https://gitee.com/weidongkl" target="_blank" rel="noopener noreferrer">weidongkl</a></li>
              <li><strong>Email</strong>: weidongkx@gmail.com</li>
            </ul>
          </div>
          
          {/* 右侧图片 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '1rem'
          }}>
            <img 
              src="/img/about.png" 
              alt="About the Author" 
              style={{
                maxWidth: '188px',
                width: '100%',
                height: 'auto',
                borderRadius: '8px'
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
