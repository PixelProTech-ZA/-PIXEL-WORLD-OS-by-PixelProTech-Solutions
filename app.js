/* ============================================================
   PIXEL WORLD OS — application logic
   No fake data, no fake functionality. See About page.
   ============================================================ */

const state = {
  catalogue: [],
  categories: {},
  families: {},
  drivers: [],
  byId: {},
  route: 'home',
  compareIds: [],
  finderMatches: null,
};

const view = document.getElementById('view');
const modalRoot = document.getElementById('modalRoot');

/* ---------------- data loading ---------------- */
async function loadData(){
  const [cat, categories, families, drivers] = await Promise.all([
    fetch('data/meta/catalogue.json').then(r => r.json()),
    fetch('data/meta/categories.json').then(r => r.json()),
    fetch('data/meta/families.json').then(r => r.json()),
    fetch('data/meta/drivers.json').then(r => r.json()),
  ]);
  state.catalogue = cat;
  state.categories = categories;
  state.families = families;
  state.drivers = drivers;
  cat.forEach(os => state.byId[os.id] = os);
}

/* ---------------- routing ---------------- */
function navigate(route){
  state.route = route;
  document.querySelectorAll('nav.tabs button').forEach(b => {
    b.classList.toggle('active', b.dataset.route === route);
  });
  render();
  window.scrollTo({top:0, behavior:'instant' in window ? 'instant' : 'auto'});
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-route]');
  if(el){
    e.preventDefault();
    navigate(el.dataset.route);
  }
  const osCard = e.target.closest('[data-open-os]');
  if(osCard){
    openOsWindow(osCard.dataset.openOs);
  }
});

/* ---------------- render dispatcher ---------------- */
function render(){
  if(state.route === 'home') return renderHome();
  if(state.route === 'catalogue') return renderCatalogue();
  if(state.route === 'finder') return renderFinder();
  if(state.route === 'compare') return renderCompare();
  if(state.route === 'families') return renderFamilies();
  if(state.route === 'drivers') return renderDrivers();
  if(state.route === 'about') return renderAbout();
  if(state.route === 'report') return renderReport();
  view.innerHTML = '<div class="empty-state">Unknown view.</div>';
}

/* ---------------- helpers ---------------- */
function statusClass(status){
  if(status === 'ACTIVE') return 'ACTIVE';
  if(status === 'EXPERIMENTAL') return 'EXPERIMENTAL';
  if(status === 'LEGACY' || status === 'ARCHIVED') return status;
  if(status === 'SLOW DEVELOPMENT') return 'SLOW';
  return 'UNKNOWN';
}

function osCardHTML(os){
  return `
  <div class="os-card" data-open-os="${os.id}" tabindex="0" role="button" aria-label="Open ${os.name} details">
    <div class="titlebar">
      <span class="dot gold"></span><span class="dot green"></span><span class="dot dim"></span>
      <span class="status-pill ${statusClass(os.status)}">${os.status}</span>
    </div>
    <div class="body">
      <h3>${os.name}</h3>
      <div class="fam">${os.family}</div>
      <p>${os.tagline || os.what_makes_it_different || ''}</p>
      <div class="tags">
        <span class="status-pill">${(os.kernel||'').split('(')[0].trim().slice(0,22)}</span>
      </div>
    </div>
  </div>`;
}

function randomOS(pool){
  const p = pool && pool.length ? pool : state.catalogue;
  return p[Math.floor(Math.random() * p.length)];
}

const OBSCURE_IDS = ['redox-os','serenityos','reactos','haiku','tiny-core','void-linux','guix-system','artix-linux','freedos','ms-dos','xenix','singularity','windows-iot-enterprise-ltsc'];

/* ================= HOME ================= */
function renderHome(){
  view.innerHTML = `
  <section class="hero">
    <div class="world-globe" aria-hidden="true">
      <svg viewBox="0 0 400 400" class="globe-svg">
        <g class="globe-spin">
          <ellipse cx="200" cy="200" rx="150" ry="150" class="globe-ring" />
          <ellipse cx="200" cy="200" rx="150" ry="60" class="globe-ring" />
          <ellipse cx="200" cy="200" rx="150" ry="110" class="globe-ring" />
          <ellipse cx="200" cy="200" rx="60" ry="150" class="globe-ring" />
          <ellipse cx="200" cy="200" rx="110" ry="150" class="globe-ring" />
          <line x1="50" y1="200" x2="350" y2="200" class="globe-ring" />
          <circle cx="200" cy="50" r="3" class="node gold" />
          <circle cx="316" cy="126" r="3" class="node green" />
          <circle cx="316" cy="274" r="3" class="node gold" />
          <circle cx="200" cy="350" r="3" class="node green" />
          <circle cx="84" cy="274" r="3" class="node gold" />
          <circle cx="84" cy="126" r="3" class="node green" />
          <circle cx="140" cy="90" r="3" class="node green" />
          <circle cx="260" cy="90" r="3" class="node gold" />
          <circle cx="260" cy="310" r="3" class="node green" />
          <circle cx="140" cy="310" r="3" class="node gold" />
          <circle cx="200" cy="200" r="3.5" class="node gold" />
        </g>
      </svg>
    </div>
    <div class="hero-eyebrow">THE PC OPERATING SYSTEM DISCOVERY LABORATORY</div>
    <h1>There is more than one<br>way to use a computer.</h1>
    <p class="lede">Pixel World OS is a visual, honest catalogue of ${state.catalogue.length} real PC operating systems &mdash;
    Linux, BSD, Windows-lineage, alternative and legacy &mdash; with real official links, real hardware notes, and clearly labeled gaps
    where information hasn't been verified.</p>

    <div class="search-shell">
      <input id="heroSearch" type="text" placeholder="What operating system are you looking for? Try &quot;2GB RAM&quot;, &quot;BSD&quot;, &quot;no systemd&quot;..." />
      <span class="kbd">ENTER</span>
    </div>

    <div class="tiles">
      <button class="tile" data-route="finder"><b>I HAVE AN OLD PC</b>Find something that'll run</button>
      <button class="tile" data-quick="alternative"><b>ESCAPE THE DEFAULT</b>Not Windows, not typical Linux</button>
      <button class="tile" data-quick="beginner"><b>LEARN LINUX</b>Beginner-friendly starting points</button>
      <button class="tile" data-quick="bsd"><b>I WANT BSD</b>The other Unix family</button>
      <button class="tile" data-quick="alternative2"><b>SOMETHING WEIRD</b>Independent, from-scratch OSes</button>
      <button class="tile" data-quick="gaming"><b>GAMING</b>SteamOS, Bazzite, Nobara and more</button>
      <button class="tile" data-quick="privacy"><b>PRIVACY</b>Tails, Whonix, and security distros</button>
      <button class="tile" data-quick="server"><b>SERVER</b>Debian, FreeBSD, Proxmox, TrueNAS</button>
      <button class="tile" data-route="catalogue"><b>EXPERIMENT</b>Browse the full catalogue</button>
      <button class="tile surprise" id="surpriseBtn"><b>SHOW ME SOMETHING I'VE NEVER HEARD OF</b>Random obscure pick</button>
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <h2>Recently added to the catalogue</h2>
      <span class="count">${state.catalogue.length} systems tracked</span>
    </div>
    <div class="grid" id="homeGrid"></div>
  </section>
  `;

  const sample = state.catalogue.slice(0, 8);
  document.getElementById('homeGrid').innerHTML = sample.map(osCardHTML).join('');

  document.getElementById('surpriseBtn').addEventListener('click', () => {
    const pool = state.catalogue.filter(o => OBSCURE_IDS.includes(o.id) || o.status !== 'ACTIVE');
    const pick = randomOS(pool.length ? pool : state.catalogue);
    openOsWindow(pick.id, true);
  });

  document.getElementById('heroSearch').addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){
      navigate('catalogue');
      setTimeout(() => {
        const inp = document.getElementById('catalogueSearch');
        if(inp){ inp.value = e.target.value; inp.dispatchEvent(new Event('input')); }
      }, 0);
    }
  });

  document.querySelectorAll('[data-quick]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigate('catalogue');
      setTimeout(() => applyQuickFilter(btn.dataset.quick), 0);
    });
  });
}

function applyQuickFilter(key){
  const map = {
    alternative: 'alternative', beginner: 'beginner', bsd: 'bsd',
    alternative2: 'experimental', gaming: 'gaming', privacy: 'privacy', server: 'server'
  };
  const catKey = map[key];
  const sel = document.getElementById('catFilter');
  if(sel && catKey){ sel.value = catKey; sel.dispatchEvent(new Event('change')); }
}

/* ================= CATALOGUE ================= */
function renderCatalogue(){
  const familyNames = Object.keys(state.families).sort();
  view.innerHTML = `
  <section class="section" style="border-top:none; padding-top:36px;">
    <div class="section-head">
      <h2>Full catalogue</h2>
      <span class="count" id="catCount"></span>
    </div>
    <div class="filters">
      <input id="catalogueSearch" type="text" placeholder="Search name, family, hardware, purpose..." style="min-width:260px;" />
      <select id="catFilter">
        <option value="">All categories</option>
        <option value="old-pc">Good for old PCs</option>
        <option value="gaming">Gaming</option>
        <option value="server">Server</option>
        <option value="privacy">Privacy</option>
        <option value="bsd">BSD</option>
        <option value="alternative">Alternative</option>
        <option value="legacy">Legacy / archived</option>
        <option value="experimental">Experimental</option>
        <option value="beginner">Beginner-friendly</option>
      </select>
      <select id="famFilter">
        <option value="">All families</option>
        ${familyNames.map(f => `<option value="${f}">${f}</option>`).join('')}
      </select>
      <select id="statusFilter">
        <option value="">All statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="EXPERIMENTAL">Experimental</option>
        <option value="LEGACY">Legacy</option>
        <option value="ARCHIVED">Archived</option>
      </select>
    </div>
    <div class="grid" id="catalogueGrid"></div>
    <div class="empty-state" id="catalogueEmpty" style="display:none;">No matches. Try clearing a filter.</div>
  </section>
  `;

  const searchInp = document.getElementById('catalogueSearch');
  const catFilter = document.getElementById('catFilter');
  const famFilter = document.getElementById('famFilter');
  const statusFilter = document.getElementById('statusFilter');

  function apply(){
    let list = state.catalogue;
    const q = searchInp.value.trim().toLowerCase();
    if(q){
      list = list.filter(os => {
        const hay = [
          os.name, os.family, os.kernel, os.package_manager,
          (os.desktop_environments||[]).join(' '),
          os.why_it_exists, os.who_its_for, os.what_makes_it_different,
          os.installation_difficulty,
          Object.values(os.hardware||{}).join(' ')
        ].join(' ').toLowerCase();
        return hay.includes(q);
      });
    }
    if(catFilter.value){
      const ids = state.categories[catFilter.value] || [];
      list = list.filter(os => ids.includes(os.id));
    }
    if(famFilter.value){ list = list.filter(os => os.family === famFilter.value); }
    if(statusFilter.value){ list = list.filter(os => os.status === statusFilter.value); }

    document.getElementById('catalogueGrid').innerHTML = list.map(osCardHTML).join('');
    document.getElementById('catCount').textContent = `${list.length} of ${state.catalogue.length} systems`;
    document.getElementById('catalogueEmpty').style.display = list.length ? 'none' : 'block';
  }

  [searchInp, catFilter, famFilter, statusFilter].forEach(el => {
    el.addEventListener('input', apply);
    el.addEventListener('change', apply);
  });
  apply();
}

/* ================= OS DETAIL WINDOW ================= */
const PANELS = ['overview','hardware','install','drivers','how','downloads','related'];

function openOsWindow(id, surprise){
  const os = state.byId[id];
  if(!os) return;

  const links = os.links || {};
  const linkRow = (label, url, type) => url ? `<a class="link-btn" href="${url}" target="_blank" rel="noopener">${label}<span class="badge">${type}</span></a>` : '';

  modalRoot.innerHTML = `
  <div class="overlay" id="osOverlay">
    <div class="os-window">
      <div class="win-titlebar">
        <span class="dot gold"></span><span class="dot green"></span><span class="dot dim"></span>
        <b>${os.name.toUpperCase()}</b>
        <button class="close" id="closeOsWin">CLOSE ✕</button>
      </div>
      <div class="win-body">
        ${surprise ? `<div class="hero-eyebrow" style="margin-bottom:12px;">YOU PROBABLY HAVEN'T TRIED THIS.</div>` : ''}
        <div class="win-head">
          <div>
            <h2>${os.official_name || os.name}</h2>
          </div>
          <span class="status-pill ${statusClass(os.status)}">${os.status}</span>
        </div>
        <div class="win-tagline">${os.tagline || ''}</div>
        <div class="win-meta">
          <span class="tag">${os.family}</span>
          <span class="tag">${os.kernel}</span>
          <span class="tag">${(os.cpu_architectures||[]).join(', ')}</span>
        </div>
        ${os.status_note ? `<p class="notverified">Status note: ${os.status_note}</p>` : ''}

        <div class="win-nav" id="winNav">
          <button data-panel="overview" class="active">OVERVIEW</button>
          <button data-panel="hardware">HARDWARE</button>
          <button data-panel="install">INSTALL</button>
          <button data-panel="drivers">DRIVERS</button>
          <button data-panel="how">HOW IT WORKS</button>
          <button data-panel="downloads">OFFICIAL LINKS</button>
          <button data-panel="related">RELATED</button>
        </div>

        <div class="win-panel active" data-panel="overview">
          <h4>Why it exists</h4><p>${os.why_it_exists || '<span class="notverified">Not verified</span>'}</p>
          <h4>Who it's for</h4><p>${os.who_its_for || '<span class="notverified">Not verified</span>'}</p>
          <h4>What makes it different</h4><p>${os.what_makes_it_different || '<span class="notverified">Not verified</span>'}</p>
          <h4>System basics</h4>
          <div class="kv">
            <div class="k">Kernel / foundation</div><div class="v">${os.kernel}${os.foundation ? ' — ' + os.foundation : ''}</div>
            <div class="k">Desktop environments</div><div class="v">${(os.desktop_environments||[]).join(', ') || 'None by default'}</div>
            <div class="k">Package manager</div><div class="v">${os.package_manager || '<span class="notverified">Not verified</span>'}</div>
            <div class="k">Filesystems</div><div class="v">${(os.filesystems||[]).join(', ') || '<span class="notverified">Not verified</span>'}</div>
            <div class="k">Privacy / security</div><div class="v">${os.privacy_security_notes || '<span class="notverified">Not verified</span>'}</div>
          </div>
        </div>

        <div class="win-panel" data-panel="hardware">
          <h4>Minimum</h4><p>${os.hardware.minimum}</p>
          <h4>Recommended</h4><p>${os.hardware.recommended}</p>
          <div class="kv">
            <div class="k">Laptop suitability</div><div class="v">${os.hardware.laptop_suitability}</div>
            <div class="k">Desktop suitability</div><div class="v">${os.hardware.desktop_suitability}</div>
            <div class="k">Old-PC suitability</div><div class="v">${os.hardware.old_pc_suitability}</div>
            <div class="k">Server suitability</div><div class="v">${os.hardware.server_suitability}</div>
            <div class="k">Gaming suitability</div><div class="v">${os.hardware.gaming_suitability}</div>
            <div class="k">Education suitability</div><div class="v">${os.hardware.education_suitability}</div>
          </div>
          <h4>What will probably give you trouble</h4>
          <p>${os.hardware.known_trouble}</p>
          <h4>Live USB / Virtual machine</h4>
          <div class="kv">
            <div class="k">Live USB support</div><div class="v">${os.live_usb}</div>
            <div class="k">VM support</div><div class="v">${os.vm_support}</div>
          </div>
        </div>

        <div class="win-panel" data-panel="install">
          <h4>Installation difficulty</h4>
          <p>${os.installation_difficulty}</p>
          <h4>Before you install — the basics</h4>
          <p>Back up your data first. Understand whether your PC uses UEFI or legacy BIOS, whether Secure Boot
          is enabled (some distros need it off or specifically support it — check this OS's own docs), and
          decide your partition/disk plan before you begin. Dual-booting alongside another OS carries real
          risk to your existing data if partitions are resized incorrectly.</p>
          <h4>General installation steps</h4>
          <p>1. Download the official image from the link in "Official Links" below. 2. Verify the checksum/signature
          if the project provides one. 3. Create bootable media with a tool like Rufus, Etcher, or <span class="mono">dd</span>.
          4. Boot the target PC from that media. 5. Try live mode first if supported. 6. Run the installer, selecting
          the correct disk and partition scheme carefully. 7. Set up your user account. 8. Let the installer handle
          the bootloader. 9. Restart, remove the media, and run system updates. 10. Install any additional
          firmware/drivers this OS's page lists.</p>
          <p class="notverified">This is general orientation, not this OS's exact click-by-click installer — always follow
          the official installation guide linked below, since exact steps vary by release.</p>
        </div>

        <div class="win-panel" data-panel="drivers">
          <h4>Driver model for this OS</h4>
          <p>Most hardware support on ${os.name} comes from the kernel/driver stack described above (${os.kernel}).
          For specific hardware categories — GPU, Wi-Fi, printers, firmware — see the
          <a href="#" data-route="drivers">Pixel Driver Lab</a> for manufacturer-neutral guidance that applies across
          Linux/BSD systems like this one, plus official manufacturer resources.</p>
          <p class="notverified">Automatic hardware detection cannot be run from this browser page — this app cannot scan
          your physical machine. Use the OS's own live-boot mode to check real compatibility before installing.</p>
        </div>

        <div class="win-panel" data-panel="how">
          <h4>How this actually works, in plain terms</h4>
          <p>The <strong>kernel</strong> (${os.kernel}) talks directly to your hardware. A <strong>bootloader</strong> hands
          control to the kernel when you power on. The <strong>filesystem</strong> (${(os.filesystems||[]).join(', ') || 'varies'})
          organizes how files are stored on disk. The <strong>package manager</strong> (${os.package_manager || 'varies'})
          installs and updates software from trusted <strong>repositories</strong>. A <strong>desktop environment</strong>
          (if one is included) is the graphical layer you actually click around in — some OSes on this list have none by
          default and expect you to add one. Day-to-day you'll work as a normal <strong>user</strong> account, and use
          <strong>root/admin privileges</strong> only for system changes, often through a <strong>terminal</strong>
          running <strong>applications</strong> installed via that package manager.</p>
        </div>

        <div class="win-panel" data-panel="downloads">
          <h4>Official links</h4>
          <div class="link-row">
            ${linkRow('OFFICIAL WEBSITE', links.official_website, 'Official')}
            ${linkRow('DOWNLOAD', links.download, 'Official')}
            ${linkRow('DOCUMENTATION', links.documentation, 'Official Documentation')}
            ${linkRow('INSTALLATION GUIDE', links.installation_guide, 'Official Documentation')}
            ${linkRow('RELEASE NOTES', links.release_notes, 'Official')}
            ${linkRow('SOURCE CODE', links.source_repository, 'Official Repository')}
            ${linkRow('COMMUNITY / FORUMS', links.forums_community, 'Community')}
          </div>
          <h4>Checksums / signatures</h4>
          <p>${links.checksums || '<span class="notverified">Not verified</span>'}</p>
          <h4>Mirrors</h4>
          <p>${links.mirrors || '<span class="notverified">Not verified</span>'}</p>
          <button class="link-btn" data-route="report" style="margin-top:6px;">⚠ REPORT A BROKEN LINK FOR ${os.name.toUpperCase()}</button>
        </div>

        <div class="win-panel" data-panel="related">
          <h4>Related systems</h4>
          <div class="related-list">
            ${(os.related_os||[]).map(rid => state.byId[rid] ? `<span class="related-chip" data-open-os="${rid}">${state.byId[rid].name}</span>` : '').join('') || '<span class="notverified">None recorded</span>'}
          </div>
          <h4>Alternatives worth exploring</h4>
          <div class="related-list">
            ${(os.alternatives||[]).map(rid => state.byId[rid] ? `<span class="related-chip" data-open-os="${rid}">${state.byId[rid].name}</span>` : '').join('') || '<span class="notverified">None recorded</span>'}
          </div>
          ${os.predecessor ? `<h4>Predecessor / parent</h4><p>${os.predecessor}</p>` : ''}
          ${os.successor ? `<h4>Successor / notable derivatives</h4><p>${os.successor}</p>` : ''}
        </div>

        <div class="verified-line">Last verified: ${os.last_verified}</div>
      </div>
    </div>
  </div>
  `;

  document.getElementById('closeOsWin').addEventListener('click', closeOsWindow);
  document.getElementById('osOverlay').addEventListener('click', (e) => {
    if(e.target.id === 'osOverlay') closeOsWindow();
  });
  document.addEventListener('keydown', escCloseOnce);

  document.getElementById('winNav').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-panel]');
    if(!btn) return;
    document.querySelectorAll('#winNav button').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.win-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === btn.dataset.panel));
  });
}

function escCloseOnce(e){
  if(e.key === 'Escape'){ closeOsWindow(); }
}
function closeOsWindow(){
  modalRoot.innerHTML = '';
  document.removeEventListener('keydown', escCloseOnce);
}

/* ================= FINDER ================= */
function renderFinder(){
  view.innerHTML = `
  <section class="section" style="border-top:none; padding-top:36px;">
    <div class="section-head"><h2>Find an OS for my PC</h2></div>
    <p style="color:var(--paper-dim); max-width:640px; margin-bottom:24px;">
      This filters the catalogue using each OS's documented hardware notes. It does not scan your actual
      computer — this browser page has no way to detect your real hardware — so treat results as a
      shortlist to research further, not a guarantee of compatibility.
    </p>
    <div class="finder-form">
      <div class="field">
        <label>RAM</label>
        <select id="fRam">
          <option value="any">Any</option>
          <option value="low">1–2GB</option>
          <option value="mid">4–8GB</option>
          <option value="high">16GB+</option>
        </select>
      </div>
      <div class="field">
        <label>Machine age</label>
        <select id="fAge">
          <option value="any">Any</option>
          <option value="old">10+ years old</option>
          <option value="mid">3–10 years old</option>
          <option value="new">Under 3 years old</option>
        </select>
      </div>
      <div class="field">
        <label>Form factor</label>
        <select id="fForm">
          <option value="any">Any</option>
          <option value="laptop">Laptop</option>
          <option value="desktop">Desktop</option>
        </select>
      </div>
      <div class="field">
        <label>Intended purpose</label>
        <select id="fPurpose">
          <option value="any">Any</option>
          <option value="general">General desktop</option>
          <option value="gaming">Gaming</option>
          <option value="server">Server / NAS</option>
          <option value="privacy">Privacy / security</option>
          <option value="learn">Learning Linux/BSD</option>
          <option value="different">Something completely different</option>
        </select>
      </div>
      <div class="field">
        <label>Experience level</label>
        <select id="fExp">
          <option value="any">Any</option>
          <option value="beginner">Beginner</option>
          <option value="advanced">Comfortable with the terminal</option>
        </select>
      </div>
      <div class="finder-actions">
        <button class="btn-primary" id="runFinder">FIND MATCHES</button>
        <button class="btn-secondary" id="resetFinder">RESET</button>
      </div>
    </div>
    <div id="finderResults"></div>
  </section>
  `;

  document.getElementById('runFinder').addEventListener('click', runFinder);
  document.getElementById('resetFinder').addEventListener('click', () => {
    ['fRam','fAge','fForm','fPurpose','fExp'].forEach(id => document.getElementById(id).value = 'any');
    document.getElementById('finderResults').innerHTML = '';
  });
}

function runFinder(){
  const ram = document.getElementById('fRam').value;
  const age = document.getElementById('fAge').value;
  const form = document.getElementById('fForm').value;
  const purpose = document.getElementById('fPurpose').value;
  const exp = document.getElementById('fExp').value;

  let list = state.catalogue.slice();

  const goodWords = ['excellent','very good','good'];
  const oldPcGood = os => goodWords.some(w => os.hardware.old_pc_suitability.toLowerCase().includes(w));

  if(ram === 'low' || age === 'old'){
    list = list.filter(oldPcGood);
  }
  if(form === 'laptop'){
    list = list.filter(os => goodWords.some(w => os.hardware.laptop_suitability.toLowerCase().includes(w)));
  }
  if(form === 'desktop'){
    list = list.filter(os => goodWords.some(w => os.hardware.desktop_suitability.toLowerCase().includes(w)));
  }
  if(purpose === 'gaming'){
    list = list.filter(os => state.categories.gaming.includes(os.id));
  }
  if(purpose === 'server'){
    list = list.filter(os => state.categories.server.includes(os.id));
  }
  if(purpose === 'privacy'){
    list = list.filter(os => state.categories.privacy.includes(os.id));
  }
  if(purpose === 'learn'){
    list = list.filter(os => state.categories.beginner.includes(os.id) || os.family.startsWith('BSD'));
  }
  if(purpose === 'different'){
    list = list.filter(os => state.categories.alternative.includes(os.id));
  }
  if(exp === 'beginner'){
    list = list.filter(os => ['Easy','Easy-moderate','Easy-to-moderate','Easy to run live'].some(d => (os.installation_difficulty||'').startsWith(d)) || state.categories.beginner.includes(os.id));
  }
  if(exp === 'advanced'){
    list = list.filter(os => os.status !== 'LEGACY');
  }

  // de-dupe while preserving order
  const seen = new Set();
  list = list.filter(os => !seen.has(os.id) && seen.add(os.id));

  const box = document.getElementById('finderResults');
  if(!list.length){
    box.innerHTML = `<div class="finder-result-note">No exact matches for that combination — showing is intentionally strict rather than guessing.
    Try loosening one filter, or browse the <a href="#" data-route="catalogue">full catalogue</a> instead.</div>`;
    return;
  }
  box.innerHTML = `<div class="finder-result-note">${list.length} candidate${list.length===1?'':'s'} based on documented hardware notes — verify against your exact hardware model before installing.</div>
  <div class="grid">${list.map(osCardHTML).join('')}</div>`;
}

/* ================= COMPARE ================= */
const COMPARE_ATTRS = [
  ['RAM (min)', os => os.hardware.minimum],
  ['CPU architectures', os => (os.cpu_architectures||[]).join(', ')],
  ['Desktop', os => (os.desktop_environments||[]).join(', ') || 'None by default'],
  ['Package system', os => os.package_manager],
  ['Live USB', os => os.live_usb],
  ['Gaming', os => os.hardware.gaming_suitability],
  ['Old PC', os => os.hardware.old_pc_suitability],
  ['Privacy notes', os => os.privacy_security_notes],
  ['Install difficulty', os => os.installation_difficulty],
  ['Status', os => os.status],
];

function renderCompare(){
  const opts = state.catalogue.map(os => `<option value="${os.id}">${os.name}</option>`).join('');
  view.innerHTML = `
  <section class="section" style="border-top:none; padding-top:36px;">
    <div class="section-head"><h2>Comparison engine</h2></div>
    <p style="color:var(--paper-dim); max-width:640px; margin-bottom:20px;">
      Pick 2–4 systems. Unknown fields display "Not verified" rather than a guess.
    </p>
    <div class="compare-picker">
      <select id="cmp1"><option value="">— pick a system —</option>${opts}</select>
      <select id="cmp2"><option value="">— pick a system —</option>${opts}</select>
      <select id="cmp3"><option value="">— optional —</option>${opts}</select>
      <select id="cmp4"><option value="">— optional —</option>${opts}</select>
    </div>
    <div id="compareOut"></div>
  </section>
  `;
  ['cmp1','cmp2','cmp3','cmp4'].forEach(id => {
    document.getElementById(id).addEventListener('change', renderCompareTable);
  });
}

function renderCompareTable(){
  const ids = ['cmp1','cmp2','cmp3','cmp4'].map(id => document.getElementById(id).value).filter(Boolean);
  const out = document.getElementById('compareOut');
  if(ids.length < 2){ out.innerHTML = ''; return; }
  const oses = ids.map(id => state.byId[id]);
  out.innerHTML = `
  <table class="compare-table">
    <thead><tr><th>Feature</th>${oses.map(os => `<th>${os.name}</th>`).join('')}</tr></thead>
    <tbody>
      ${COMPARE_ATTRS.map(([label, fn]) => `
        <tr><td class="attr">${label}</td>${oses.map(os => `<td>${fn(os) || '<span class="notverified">Not verified</span>'}</td>`).join('')}</tr>
      `).join('')}
    </tbody>
  </table>`;
}

/* ================= FAMILY TREE ================= */
function renderFamilies(){
  const names = Object.keys(state.families).sort();
  view.innerHTML = `
  <section class="section" style="border-top:none; padding-top:36px;">
    <div class="section-head"><h2>OS family / DNA explorer</h2></div>
    <p style="color:var(--paper-dim); max-width:640px; margin-bottom:24px;">
      Grouped by documented lineage. Click any system to open its full record, including predecessor and
      successor notes where known.
    </p>
    ${names.map(name => `
      <div class="family-group">
        <h3>${name}</h3>
        <div class="family-row">
          ${state.families[name].map(id => state.byId[id] ? `<span class="family-node" data-open-os="${id}">${state.byId[id].name}</span>` : '').join('')}
        </div>
      </div>
    `).join('')}
  </section>
  `;
}

/* ================= DRIVER LAB ================= */
function renderDrivers(){
  view.innerHTML = `
  <section class="section" style="border-top:none; padding-top:36px;">
    <div class="section-head"><h2>Pixel Driver Lab</h2></div>
    <p style="color:var(--paper-dim); max-width:680px; margin-bottom:24px;">
      Drivers are treated as a first-class part of this app. Every resource below links to an official
      manufacturer page, an official OS/kernel repository, or a clearly-labeled community resource — never
      a disguised third-party download. This app cannot detect your actual hardware from the browser, so use
      these as a manual research starting point.
    </p>
    <div class="filters">
      <input id="driverSearch" type="text" placeholder="Search manufacturer, device, chipset..." style="min-width:280px;" />
    </div>
    <div id="driverList"></div>
  </section>
  `;

  function renderList(q){
    q = (q||'').toLowerCase();
    const list = state.drivers.filter(d => !q || `${d.manufacturer} ${d.device_category}`.toLowerCase().includes(q));
    document.getElementById('driverList').innerHTML = list.map(d => `
      <div class="driver-card">
        <div class="dh"><h4>${d.manufacturer} — ${d.device_category}</h4><span class="cat">${d.label}</span></div>
        <div class="modelrow">
          <div class="k">Linux model</div><div>${d.linux_model}</div>
          <div class="k">BSD model</div><div>${d.bsd_model}</div>
          <div class="k">Windows note</div><div>${d.windows_note}</div>
        </div>
        <div class="link-row">
          ${d.resources.map(r => `<a class="link-btn" href="${r.url}" target="_blank" rel="noopener">${r.name}<span class="badge">${r.type}</span></a>`).join('')}
        </div>
        <p style="margin-top:12px; color:var(--paper-dim); font-size:12.5px;">${d.notes}</p>
      </div>
    `).join('') || '<div class="empty-state">No matches.</div>';
  }

  document.getElementById('driverSearch').addEventListener('input', (e) => renderList(e.target.value));
  renderList('');
}

/* ================= ABOUT ================= */
function renderAbout(){
  view.innerHTML = `
  <section class="section" style="border-top:none; padding-top:36px; max-width:760px;">
    <div class="section-head"><h2>About &amp; honesty statement</h2></div>
    <h4 style="font-family:'Space Mono',monospace; color:var(--green);">WHAT THIS APP IS</h4>
    <p>Pixel World OS is an educational catalogue of real, legitimate PC operating systems, built by
    PixelProTech Solutions to help people discover options beyond the default. It reads from structured
    JSON data (one file per OS) so the catalogue can grow without rebuilding the interface.</p>

    <h4 style="font-family:'Space Mono',monospace; color:var(--green);">WHAT'S IN THIS BUILD RIGHT NOW</h4>
    <p>${state.catalogue.length} operating systems across Linux, BSD, alternative/hobby, legacy and special-purpose
    categories, each with real official links (website, download, docs, source, community) drawn from
    accurate knowledge of these projects. This is a curated starting set, not the "hundreds or thousands"
    the architecture is designed to eventually hold — see below.</p>

    <h4 style="font-family:'Space Mono',monospace; color:var(--red);">WHAT THIS APP DOES NOT DO</h4>
    <p>It does not detect your real hardware. It does not test compatibility. It does not install anything.
    It does not bypass Secure Boot, firmware restrictions, or DRM. Every link was written from accurate
    knowledge of these projects rather than fetched live during this build, so treat "Last verified" dates
    as "compiled, not live-checked" — always confirm a link still resolves before relying on it, and use
    "Report Broken Link" if you find one that doesn't.</p>

    <h4 style="font-family:'Space Mono',monospace; color:var(--green);">HOW TO EXPAND THE CATALOGUE</h4>
    <p>Add a new JSON file to <span class="mono">data/os/</span> following the existing schema, then regenerate
    <span class="mono">data/meta/catalogue.json</span>. No frontend code changes are required — this is the
    entire point of the data-driven architecture.</p>
  </section>
  `;
}

/* ================= REPORT BROKEN LINK ================= */
function renderReport(){
  view.innerHTML = `
  <section class="section" style="border-top:none; padding-top:36px; max-width:640px;">
    <div class="section-head"><h2>Report a broken link</h2></div>
    <p style="color:var(--paper-dim);">
      This demo build has no backend to receive submissions, so this form doesn't send anywhere yet — that's
      stated plainly rather than faked. In a production version this would open an issue or ticket for
      PixelProTech to manually verify before any link is changed.
    </p>
    <div class="finder-form">
      <div class="field"><label>Operating system</label><input type="text" placeholder="e.g. Haiku" /></div>
      <div class="field"><label>Resource type</label><input type="text" placeholder="e.g. Download link" /></div>
      <div class="field" style="grid-column:1/-1;"><label>Broken URL</label><input type="text" placeholder="https://..." /></div>
      <div class="field" style="grid-column:1/-1;"><label>Replacement URL (if known)</label><input type="text" placeholder="https://..." /></div>
      <div class="field" style="grid-column:1/-1;"><label>Comment</label><input type="text" placeholder="Optional" /></div>
      <div class="finder-actions">
        <button class="btn-secondary" type="button" disabled>SUBMIT (not wired up in this build)</button>
      </div>
    </div>
  </section>
  `;
}

/* ================= boot ================= */
async function boot(){
  view.innerHTML = '<div class="empty-state">Loading catalogue…</div>';
  try{
    await loadData();
  }catch(err){
    view.innerHTML = `<div class="empty-state">Could not load catalogue data (${err.message}). If you're offline, cached data should load automatically once the service worker has run once online.</div>`;
    return;
  }
  navigate('home');

  window.addEventListener('online', updateOfflineBanner);
  window.addEventListener('offline', updateOfflineBanner);
  updateOfflineBanner();

  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }
}

function updateOfflineBanner(){
  document.getElementById('offlineBanner').classList.toggle('show', !navigator.onLine);
}

boot();
