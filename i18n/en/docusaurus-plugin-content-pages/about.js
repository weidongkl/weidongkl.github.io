import React from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

export default function About() {
  return (
    <Layout title="About Me" description="About the Author">
      <div style={{ padding: '2rem', maxWidth: '888px', margin: '0 auto' }}>
        <Heading as="h1">About the Author</Heading>
        
        <p>
          Hi, I'm <strong>Weidong (魏东)</strong> — a passionate software developer focusing on Golang, Linux (especially Red Hat), performance optimization, and open-source contributions like <em>openEuler</em>.
        </p>
        
        <p>
          This site is a digital notebook — recording study notes, technical insights, and thoughts on books and projects.
        </p>
        
        <blockquote>
          <strong>"Understanding the past is irreversible, knowing the future is achievable."</strong>
        </blockquote>
        
        <ul>
          <li><strong>GitHub</strong>: <a href="https://github.com/weidongkl" target="_blank" rel="noopener noreferrer">weidongkl</a></li>
          <li><strong>Gitee</strong>: <a href="https://gitee.com/weidongkl" target="_blank" rel="noopener noreferrer">weidongkl</a></li>
          <li><strong>Email</strong>: weidongkx@gmail.com</li>
        </ul>
      </div>
    </Layout>
  );
}
