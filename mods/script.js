const $ = (id) => document.getElementById(id);
const elem = (type) => document.createElement(type);

(async () => {
  let req = await fetch('/assets/mods.json');
  const data = await req.json();

  applyText('pack-version', `Samgim Modpack ${data.version}v`);
  applyText('client-version', data.client);
  applyText('mod-count', `${data.mods.length} Projects in total`);

  let ids = data.mods.map(x => `"${x.id}"`).join(',');
  let infoReq = await fetch(`https://api.modrinth.com/v2/projects?ids=[${ids}]`);
  let info = await infoReq.json();
  info.forEach(x => {
    x.info = data.mods.filter(m => m.id == x.id)[0];
  });
  data.mods.filter(x => !x.id).map(x => ({ info: x })).forEach(x => {
    info.push(x);
  });

  info = info.map(processData)
    .sort((a, b) => a.title.localeCompare(b.title))
    .sort((a, b) => a.ordinal - b.ordinal);

  let mods = createList(info);
  $('main').append(mods);
})();

function applyText(name, content) {
  Array.from(document.getElementsByName(name)).forEach(x => {
    x.textContent = content;
  });
}

function createList(data) {
  let mods = elem('div');
  mods.className = 'mods';

  data.forEach(x => {
    let container = elem('div');

    let imgWrapper = elem('div');
    let img = elem('img');
    img.src = x.icon_url;
    img.className = 'clickable';
    img.draggable = false;
    img.onclick = () => {
      nav(x.id, x.link);
    };
    imgWrapper.append(img);

    let info = elem('div');

    let head = elem('div');
    let title = elem('span');
    title.textContent = x.title;
    title.className = 'clickable';
    title.onclick = () => {
      nav(x.id, x.link);
    };

    let badges = [];
    if (x.id == 'P7dR8mSH' || x.id == 'mOgUt4GM') badges.push('star');
    else {
      if (x.categories.includes('library')) badges.push('lib');
      if (x.fix) badges.push('fix');
    }

    head.append(title, createBadges(badges, x.libs));

    let body = elem('p');
    body.textContent = x.description;

    let type = elem('span');
    type.textContent = x.project_type;
    if (x.project_type != 'mod')
      type.className = x.project_type;

    info.append(head, body, type);

    container.append(imgWrapper, info);
    mods.append(container);
  });
  return mods;
}

function processData(x) {
  return {
    icon_url: x.icon_url || x.info.icon,
    id: x.id,
    link: x.info.link,
    title: x.title || x.info.name,
    categories: x.categories ?? (x.info.lib ? ['library'] : []),
    fix: x.info.fix,
    libs: x.info.libs,
    description: x.info.description,
    project_type: x.project_type || x.info.type,
    ordinal: x.info.ordinal || Number.MAX_VALUE
  }
}

function createBadges(list, libs) {
  let div = elem('div');
  list.forEach(l => {
    let img = elem('img');
    img.src = `/assets/${l}.svg`;
    div.append(img);
  });
  if (!libs) return div;
  let img = elem('img');
  img.src = `/assets/req.svg`;
  div.append(img);
  let span = elem('span');
  span.style.color = '#58FFA5';
  span.classList = 'desktop';
  span.textContent = libs.join(', ');
  div.append(span);
  return div;
}

function nav(id, link) {
  if (id) link = `https://modrinth.com/project/${id}`;
  window.open(link, '_blank');
}
