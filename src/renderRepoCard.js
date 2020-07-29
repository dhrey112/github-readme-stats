const {
  kFormatter,
  encodeHTML,
  getCardColors,
  FlexLayout,
  wrapTextMultiline,
} = require("../src/utils");
const icons = require("./icons");
const toEmoji = require("emoji-name-map");

const renderRepoCard = (repo, options = {}) => {
  const {
    name,
    nameWithOwner,
    description,
    primaryLanguage,
    stargazers,
    isArchived,
    isTemplate,
    forkCount,
  } = repo;
  const {
    title_color,
    icon_color,
    text_color,
    bg_color,
    show_owner,
    theme = "default_repocard",
  } = options;

  const header = show_owner ? nameWithOwner : name;
  const langName = (primaryLanguage && primaryLanguage.name) || "Unspecified";
  const langColor = (primaryLanguage && primaryLanguage.color) || "#333";

  const shiftText = langName.length > 15 ? 0 : 30;

  let desc = description || "No description provided";

  // parse emojis to unicode
  desc = desc.replace(/:\w+:/gm, (emoji) => {
    return toEmoji.get(emoji) || "";
  });

  const multiLineDescription = wrapTextMultiline(desc);
  const descriptionLines = multiLineDescription.length;
  const lineHeight = 10;
  const isGradient = !(bg_color == undefined || bg_color.length == 6 || bg_color.length == 3)
  const height =
    (descriptionLines > 1 ? 120 : 110) + descriptionLines * lineHeight;

  // returns theme based colors with proper overrides and defaults
  const { titleColor, textColor, iconColor, bgColor } = getCardColors({
    title_color,
    icon_color,
    text_color,
    bg_color,
    theme,
  });
  const gradientBgColor = isGradient ? bg_color.split(',') : undefined;
  const totalStars = kFormatter(stargazers.totalCount);
  const totalForks = kFormatter(forkCount);

  const getBadgeSVG = (label) => `
    <g data-testid="badge" class="badge" transform="translate(320, 38)">
      <rect stroke="${textColor}" stroke-width="1" width="70" height="20" x="-12" y="-14" ry="10" rx="10"></rect>
      <text
        x="23" y="-5"
        alignment-baseline="central"
        dominant-baseline="central"
        text-anchor="middle"
        fill="${textColor}"
      >
        ${label}
      </text>
    </g>
  `;
  const gradient = isGradient ? `
    <defs>
      <linearGradient id="gradient" gradientTransform="rotate(${gradientBgColor[0]})">
        <stop offset="0%"  stop-color="#${gradientBgColor[1]}" />
        <stop offset="100%" stop-color="#${gradientBgColor[2]}" />
      </linearGradient>
    </defs>`
    : undefined
  const svgLanguage = primaryLanguage
    ? `
    <g data-testid="primary-lang" transform="translate(30, 0)">
      <circle data-testid="lang-color" cx="0" cy="-5" r="6" fill="${langColor}" />
      <text data-testid="lang-name" class="gray" x="15">${langName}</text>
    </g>
    `
    : "";

  const svgStars =
    stargazers.totalCount > 0 &&
    `
    <svg class="icon" y="-12" viewBox="0 0 16 16" version="1.1" width="16" height="16">
      ${icons.star}
    </svg>
    <text data-testid="stargazers" class="gray" x="25">${totalStars}</text>
  `;

  const svgForks =
    forkCount > 0 &&
    `
    <svg class="icon" y="-12" viewBox="0 0 16 16" version="1.1" width="16" height="16">
      ${icons.fork}
    </svg>
    <text data-testid="forkcount" class="gray" x="25">${totalForks}</text>
  `;

  return `
    <svg version="1.1" width="400" height="${height}" viewBox="0 0 400 ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
      .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${titleColor} }
      .description { font: 400 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor} }
      .gray { font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor} }
      .icon { fill: ${iconColor} }
      .badge { font: 600 11px 'Segoe UI', Ubuntu, Sans-Serif; }
      .badge rect { opacity: 0.2 }
      </style>
      ${isGradient ? gradient : ""}
      <rect data-testid="card-bg" x="0.5" y="0.5" width="399" height="99%" rx="4.5" fill="${isGradient ? "url('#gradient')" : bgColor}" stroke="#E4E2E2"/>
      <svg class="icon" x="25" y="25" viewBox="0 0 16 16" version="1.1" width="16" height="16">
        ${icons.contribs}
      </svg>

      <text x="50" y="38" class="header">${header}</text>

      ${
        isTemplate
          ? getBadgeSVG("Template")
          : isArchived
          ? getBadgeSVG("Archived")
          : ""
      }

      <text class="description" x="25" y="50">
        ${multiLineDescription
          .map((line) => `<tspan dy="1.2em" x="25">${encodeHTML(line)}</tspan>`)
          .join("")}
      </text>

      <g transform="translate(0, ${height - 20})">
        ${svgLanguage}

        <g 
          data-testid="star-fork-group" 
          transform="translate(${primaryLanguage ? 155 - shiftText : 25}, 0)"
        >
          ${FlexLayout({ items: [svgStars, svgForks], gap: 65 }).join("")}
        </g>
      </g>
    </svg>
  `;
};

module.exports = renderRepoCard;
