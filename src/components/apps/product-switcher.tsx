"use client"

import { Grid3x3 } from "lucide-react"
import { KitDropdown } from "./primitives"

const PS_CORAL = "#F6B0A3"
const PS_RED = "#FF3621"

function PLAnalytics() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 4.5 L22 10 V16.5 H6 V10 Z" fill={PS_CORAL} />
      <path
        d="M6 16.8 q4 -2.4 8 0 t8 0 V21 a1.6 1.6 0 0 1 -1.6 1.6 H7.6 A1.6 1.6 0 0 1 6 21 Z"
        fill={PS_RED}
      />
    </svg>
  )
}

function PLGenie() {
  return (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M26.1728 51.1328C24.0076 51.1328 22.2523 53.312 22.2523 56.0002H40.4375C40.4375 53.312 38.6822 51.1328 36.517 51.1328H26.1728Z"
        fill="#FF5F46"
      />
      <path
        d="M57.4765 25.8521C53.608 32.0667 47.8002 40.6186 45.2069 42.813C42.6135 45.0074 38.7676 48.963 29.853 48.963C23.6077 48.963 18.2356 44.9518 15.8512 39.1994C15.8513 39.2062 15.8513 39.213 15.8514 39.2196C15.5135 38.3802 14.6922 37.7873 13.7318 37.7873C12.47 37.7873 11.447 38.8103 11.447 40.0721C11.4471 40.3682 11.5034 40.6393 11.606 40.881C12.1548 42.1739 13.615 42.2289 13.615 46.2621C13.615 46.8493 13.615 45.793 13.615 46.2621C9.82225 46.2621 6.74764 43.1874 6.74756 39.3947C6.74756 35.602 9.8222 32.5273 13.615 32.5273H14.5359V32.5261H25.4449C26.2598 32.5261 27.0421 32.8712 27.5512 33.5075C28.4433 34.6224 29.127 35.6603 29.631 36.5168C30.0979 37.3102 31.4961 37.3179 31.9583 36.5217C32.4457 35.6822 33.093 34.6679 33.9135 33.5775C34.4232 32.9002 35.2329 32.5261 36.0804 32.5261H40.1366C46.0643 32.5261 49.3134 29.6841 50.9725 27.6358C51.831 26.5758 53.0503 25.8521 54.4143 25.8521H57.4765Z"
        fill="#FABFBA"
      />
      <path
        d="M30.8428 35.7656C30.8427 28.1161 24.742 21.9116 17.2056 21.883C24.7421 21.8544 30.8428 15.6496 30.8428 8C30.8428 8 30.8428 8.00001 30.8428 8C30.8428 15.6673 36.972 21.8828 44.5326 21.8828C36.9721 21.8828 30.8428 28.0984 30.8428 35.7656Z"
        fill="#FF5F46"
      />
    </svg>
  )
}

function PLLakebase() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="5" y="6.5" width="18" height="3" rx="1" fill={PS_CORAL} />
      <rect x="5" y="11.5" width="18" height="3" rx="1" fill={PS_CORAL} />
      <path
        d="M5 17.2 q4.5 -2.4 9 0 t9 0 V21 a1 1 0 0 1 -1 1 H6 a1 1 0 0 1 -1 -1 Z"
        fill={PS_RED}
      />
    </svg>
  )
}

function PLApps() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="7.5" height="7.5" rx="1.5" fill={PS_CORAL} />
      <rect x="15.5" y="5" width="7.5" height="7.5" rx="1.5" fill={PS_RED} />
      <rect x="5" y="15.5" width="7.5" height="7.5" rx="1.5" fill={PS_RED} />
      <rect x="15.5" y="15.5" width="7.5" height="7.5" rx="1.5" fill={PS_CORAL} />
    </svg>
  )
}

function PLLakewatch() {
  return (
    <svg width="28" height="28" viewBox="0 0 256 256" fill="none" aria-hidden="true">
      <path
        d="M92.5657 63.7073C111.064 63.7073 127.757 71.4394 139.589 83.848L120.801 96.8565C98.5764 112.243 98.5765 145.097 120.801 160.483L139.586 173.489C127.755 185.897 111.064 193.629 92.5657 193.629C56.6887 193.629 27.6047 164.546 27.6047 128.668C27.605 92.7915 56.6889 63.7076 92.5657 63.7073Z"
        fill="#FF5F46"
      />
      <path
        d="M209.421 35.5103C217.441 29.9585 228.395 35.6971 228.395 45.4509V211.889C228.395 221.642 217.441 227.381 209.421 221.829L139.596 173.487C150.709 161.831 157.532 146.049 157.532 128.672C157.532 111.293 150.707 95.5071 139.591 83.8495L209.421 35.5103Z"
        fill="#FABFBA"
      />
    </svg>
  )
}

const PRODUCTS = [
  { name: "Analytics and AI", desc: "Analyze & train on large-scale data", logo: PLAnalytics },
  { name: "Genie One", desc: "Conversational AI for your data", logo: PLGenie },
  { name: "Lakebase Postgres", desc: "Operational databases for applications", logo: PLLakebase },
  { name: "Databricks Apps", desc: "Create and manage your Databricks apps", logo: PLApps },
  { name: "Lakewatch", desc: "Security and event management", logo: PLLakewatch },
]

export function ProductSwitcher() {
  return (
    <KitDropdown
      align="end"
      width={340}
      trigger={
        <button type="button" className="btn-icon" aria-label="Apps menu">
          <Grid3x3 className="lucide" />
        </button>
      }
    >
      <div className="product-switcher">
        {PRODUCTS.map((p) => {
          const Logo = p.logo
          return (
            <button key={p.name} type="button" className="product-item">
              <span className="product-logo">
                <Logo />
              </span>
              <span className="product-text">
                <span className="product-name">{p.name}</span>
                <span className="product-desc">{p.desc}</span>
              </span>
            </button>
          )
        })}
      </div>
    </KitDropdown>
  )
}
