import React from 'react';
import { Link } from 'react-router-dom';
import { IconArrowLeft } from '../components/Icons';
import '../styles/Pages-Legal.css';

export default function TermsPage() {
  return (
    <div className="pg pg-legal">
      <article className="legal-article">

        <Link to="/" className="legal-back">
          <IconArrowLeft size={14} /> Back to Home
        </Link>

        <p className="legal-eyebrow">Legal</p>
        <h1 className="legal-title">Terms of Service</h1>
        <p className="legal-meta">Last updated: June 26, 2026 · Effective immediately</p>

        <div className="legal-section">
          <h2>1. Acceptance of terms</h2>
          <p>
            By accessing or using BadgeGen ("the Service"), you agree to be bound by
            these Terms of Service. If you do not agree to these terms, please do not
            use the Service.
          </p>
          <p>
            These terms apply to all visitors, users, and others who access or use the
            Service.
          </p>
        </div>

        <div className="legal-section">
          <h2>2. Description of the service</h2>
          <p>
            BadgeGen is a free, open-source browser-based tool that allows users to
            create personalized name badges from template images and name lists. All
            processing occurs locally in the user's browser. No data is transmitted
            to or stored on any server operated by BadgeGen.
          </p>
        </div>

        <div className="legal-section">
          <h2>3. Use of the service</h2>
          <p>You agree to use the Service only for lawful purposes. You must not:</p>
          <ul>
            <li>Use the Service to create content that is defamatory, fraudulent, or violates any applicable law.</li>
            <li>Attempt to reverse-engineer, decompile, or extract the source code beyond what is already publicly available.</li>
            <li>Use the Service in any way that could damage, disable, or impair its functionality.</li>
            <li>Represent that BadgeGen endorses or is responsible for any badge content you create.</li>
          </ul>
          <p>
            You retain full ownership of the content you create with BadgeGen,
            including badge images and template files you upload.
          </p>
        </div>

        <div className="legal-section">
          <h2>4. Intellectual property</h2>
          <p>
            The BadgeGen software is released under the MIT License and is freely
            available at{' '}
            <a href="https://github.com/chahe-dridi/script-badge-generator" target="_blank" rel="noreferrer">
              GitHub
            </a>
            . You are free to use, copy, modify, merge, publish, distribute, sublicense,
            and sell copies of the software, subject to the MIT License terms.
          </p>
          <p>
            The BadgeGen name, logo, and visual identity are not covered by the MIT
            License and may not be used without explicit written permission.
          </p>
        </div>

        <div className="legal-section">
          <h2>5. Disclaimer of warranties</h2>
          <p>
            The Service is provided "as is" and "as available" without any warranty of
            any kind, express or implied, including but not limited to warranties of
            merchantability, fitness for a particular purpose, or non-infringement.
          </p>
          <div className="legal-highlight">
            <p>
              BadgeGen does not guarantee that the Service will be uninterrupted,
              error-free, or free of viruses or other harmful components.
              Use of the Service is at your own risk.
            </p>
          </div>
        </div>

        <div className="legal-section">
          <h2>6. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by applicable law, BadgeGen and its
            contributors shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages, including loss of data, revenue, or
            goodwill, arising from your use of (or inability to use) the Service.
          </p>
          <p>
            In no event shall our total liability to you for all claims exceed the
            amount you paid to use the Service (which is zero, as the Service is free).
          </p>
        </div>

        <div className="legal-section">
          <h2>7. Third-party content and links</h2>
          <p>
            The Service may contain links to third-party websites or services (e.g.
            GitHub). BadgeGen has no control over and accepts no responsibility for
            the content, privacy policies, or practices of any third-party websites.
          </p>
          <p>
            Badge templates and name data that you upload are entirely your
            responsibility. BadgeGen cannot access this data.
          </p>
        </div>

        <div className="legal-section">
          <h2>8. Changes to terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Changes will be
            posted on this page with an updated effective date. Continued use of the
            Service after changes are posted constitutes acceptance of the revised terms.
          </p>
        </div>

        <div className="legal-section">
          <h2>9. Governing law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with
            applicable law. Any disputes relating to these Terms shall be subject to
            the jurisdiction of the competent courts.
          </p>
        </div>

        <div className="legal-section">
          <h2>10. Contact</h2>
          <p>
            If you have any questions about these Terms, please open an issue on our{' '}
            <a href="https://github.com/chahe-dridi/script-badge-generator/issues" target="_blank" rel="noreferrer">
              GitHub repository
            </a>
            .
          </p>
          <p>
            Also see our <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>

      </article>
    </div>
  );
}
