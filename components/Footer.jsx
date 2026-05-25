"use client";


import { BsInstagram } from "react-icons/bs"
import { FaSquareXTwitter } from "react-icons/fa6";

import {
  FaCcVisa,
  FaCcMastercard,
  FaApplePay,
  FaGooglePay,
  FaFacebook,
  FaLinkedin
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 mt-24 bg-gray-50 text-black">
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16">

        {/* TOP SECTION */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* INFO */}
          <div>
            <h3 className="text-sm uppercase tracking-[0.2em] mb-5">
              Info
            </h3>

            <ul className="space-y-3 text-sm text-zinc-600">
              <li>
                <a href="#" className="hover:text-black transition">
                  About
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-black transition">
                  Shipping
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-black transition">
                  Returns
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-black transition">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-sm uppercase tracking-[0.2em] mb-5">
              Contact
            </h3>

            <ul className="space-y-3 text-sm text-zinc-600">
              <li>support@mokes.com</li>
              <li>+234 812 345 6789</li>
              <li>Lagos, Nigeria</li>
            </ul>
          </div>

          {/* CAREERS */}
          <div>
            <h3 className="text-sm uppercase tracking-[0.2em] mb-5">
              Careers
            </h3>

            <ul className="space-y-3 text-sm text-zinc-600">
              <li>
                <a href="#" className="hover:text-black transition">
                  Open Roles
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-black transition">
                  Culture
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-black transition">
                  Internships
                </a>
              </li>
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div>
            <h3 className="text-sm uppercase tracking-[0.2em] mb-5">
              Newsletter
            </h3>

            <p className="text-sm text-zinc-600 mb-4">
              Subscribe for updates, releases, and exclusive offers.
            </p>

            <div className="flex flex-col border border-zinc-300 overflow-hidden">
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-4 py-3 text-sm outline-none"
              />

              <button className="w-full px-5 py-3 text-sm border-t border-zinc-300 cursor-pointer bg-[var(--sage)] text-white hover:bg-zinc-500 transition uppercase">
                Subscribe
              </button>
            </div>
          </div>

        </div>

        {/* SOCIALS + PAYMENTS */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-16">

          {/* SOCIAL ICONS */}
          <div className="flex items-center gap-5 text-zinc-600">
            <a href="#" className="hover:text-black transition">
              <BsInstagram size={18} />
            </a>

            <a href="#" className="hover:text-black transition">
              <FaSquareXTwitter size={18} />
            </a>

            <a href="#" className="hover:text-black transition">
              <FaFacebook size={18} />
            </a>

            <a href="#" className="hover:text-black transition">
              <FaLinkedin size={18} />
            </a>
          </div>

          {/* PAYMENT ICONS */}
          <div className="flex items-center gap-5 text-3xl text-zinc-500">
            <FaCcVisa />
            <FaCcMastercard />
            <FaApplePay />
            <FaGooglePay />
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="mt-6 pt-6">
          <p className="text-xs tracking-wide text-zinc-500">
            © 2026 MOKÉS. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}