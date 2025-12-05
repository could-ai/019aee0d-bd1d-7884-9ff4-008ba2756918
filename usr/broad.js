application.get("/guilds", async (request, response) => {
  const {
    query: { guild_id, broadcast_id, skey, bot_id },
  } = request;

  // --- Unified Error Page Function ---
  const sendErrorPage = (res, title, message) => {
    const errorHtml = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" type="image/png" href="https://i.imghippo.com/files/LNkv3093hk.png">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --bg-dark: #121212;
            --surface-dark: #1e1e1e;
            --primary-dark: #bb86fc;
            --text-dark: #e0e0e0;
            --text-secondary-dark: #a0a0a0;
            
            --bg-light: #f5f5f5;
            --surface-light: #ffffff;
            --primary-light: #6200ee;
            --text-light: #121212;
            --text-secondary-light: #5f5f5f;

            --shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
            --border-radius: 16px;
          }
          body {
            font-family: 'Cairo', sans-serif;
            background-color: var(--bg-dark);
            color: var(--text-dark);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
            transition: background-color 0.3s, color 0.3s;
          }
          .error-container {
            background-color: var(--surface-dark);
            padding: 40px;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            text-align: center;
            max-width: 500px;
            width: 100%;
            border-top: 4px solid var(--primary-dark);
            animation: fadeInUp 0.5s ease-out;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .error-icon {
            font-size: 4rem;
            margin-bottom: 20px;
            animation: pulse 1.5s infinite ease-in-out;
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          h1 {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 12px;
            color: var(--primary-dark);
          }
          p {
            font-size: 1.1rem;
            color: var(--text-secondary-dark);
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <div class="error-icon">⚠️</div>
          <h1>${title}</h1>
          <p>${message}</p>
        </div>
      </body>
      </html>
    `;
    res.status(400).send(errorHtml);
  };

  if (!guild_id || !skey) {
    return sendErrorPage(response, "خطأ في البيانات", "يرجى توفير البيانات الصحيحة للمتابعة.");
  }

  const guild = client.guilds.cache.get(guild_id);
  if (!guild) {
    return sendErrorPage(response, "خطأ في التعرف على الخادم", "يرجى اضافة البوت الى الخادم والمحاولة مرة اخرى.");
  }

  const theSkey = guild.ownerId.slice(5, 9);
  if (theSkey !== skey) {
    return sendErrorPage(response, "خطأ - المفتاح غير صحيح", "المفتاح الذي أدخلته غير صحيح. يرجى التحقق منه والمحاولة مرة أخرى.");
  }

  const broadcastData = await db.get(`broadcast_${guild.id}_${bot_id}`);
  if (!broadcastData) {
    return sendErrorPage(response, "لا توجد بيانات بث", "لم يتم العثور على بيانات بث نشطة لهذا الخادم.");
  }

  await guild.members.fetch();
  const members = guild.members.cache;
  const sentTo = broadcastData.sent_to || [];
  const filteredMembers = members.filter(member => !member.user.bot);

  response.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>قائمة أعضاء ${guild.name}</title>
      <link rel="icon" type="image/png" href="${guild.iconURL()}">
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --bg-dark: #121212;
          --surface-dark: #1e1e1e;
          --primary-dark: #bb86fc;
          --text-dark: #e0e0e0;
          --text-secondary-dark: #a0a0a0;
          --border-dark: #333333;
          --success-dark: #03dac6;
          --error-dark: #cf6679;

          --bg-light: #f5f5f5;
          --surface-light: #ffffff;
          --primary-light: #6200ee;
          --text-light: #121212;
          --text-secondary-light: #5f5f5f;
          --border-light: #e0e0e0;
          --success-light: #018786;
          --error-light: #b00020;

          --shadow: 0 4px 6px rgba(0,0,0,0.1);
          --border-radius: 12px;
          --transition-speed: 0.3s;
        }

        body {
          font-family: 'Cairo', sans-serif;
          background-color: var(--bg-dark);
          color: var(--text-dark);
          margin: 0;
          padding: 20px;
          transition: background-color var(--transition-speed), color var(--transition-speed);
        }

        body.light-mode {
          --bg-dark: var(--bg-light);
          --surface-dark: var(--surface-light);
          --primary-dark: var(--primary-light);
          --text-dark: var(--text-light);
          --text-secondary-dark: var(--text-secondary-light);
          --border-dark: var(--border-light);
          --success-dark: var(--success-light);
          --error-dark: var(--error-light);
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
          padding: 20px;
          background-color: var(--surface-dark);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          animation: slideDown 0.5s ease-out;
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .guild-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--primary-dark);
          animation: spin 8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .header-info h1 {
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary-dark);
        }

        .header-info p {
          margin: 5px 0 0;
          font-size: 1rem;
          color: var(--text-secondary-dark);
        }

        .controls {
          margin-bottom: 20px;
          background-color: var(--surface-dark);
          padding: 15px;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          animation: fadeIn 0.5s 0.2s ease-out backwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .search-input {
          width: 100%;
          padding: 12px 15px;
          border-radius: 8px;
          border: 1px solid var(--border-dark);
          background-color: var(--bg-dark);
          color: var(--text-dark);
          font-family: 'Cairo', sans-serif;
          font-size: 1rem;
          transition: border-color var(--transition-speed), box-shadow var(--transition-speed);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-dark);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-dark) 25%, transparent);
        }

        .user-list {
          display: grid;
          gap: 15px;
        }

        .user-item {
          display: flex;
          align-items: center;
          padding: 15px;
          background-color: var(--surface-dark);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          border-left: 5px solid;
          transition: transform var(--transition-speed), box-shadow var(--transition-speed);
          animation: popIn 0.5s ease-out backwards;
        }

        .user-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 12px rgba(0,0,0,0.15);
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .user-item.sent {
          border-color: var(--success-dark);
        }

        .user-item.not-sent {
          border-color: var(--error-dark);
        }

        .user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          margin-left: 15px;
          object-fit: cover;
        }

        .user-info {
          flex-grow: 1;
        }

        .user-info .username {
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--text-dark);
        }

        .user-info .userid {
          font-size: 0.9rem;
          color: var(--text-secondary-dark);
        }

        .status {
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .status.sent {
          background-color: color-mix(in srgb, var(--success-dark) 15%, transparent);
          color: var(--success-dark);
        }

        .status.not-sent {
          background-color: color-mix(in srgb, var(--error-dark) 15%, transparent);
          color: var(--error-dark);
        }
        
        #empty-state, #loading-state {
            display: none;
            text-align: center;
            padding: 40px;
            color: var(--text-secondary-dark);
            font-size: 1.2rem;
            background-color: var(--surface-dark);
            border-radius: var(--border-radius);
            animation: fadeIn 0.5s ease-out;
        }

        .theme-toggle {
          position: fixed;
          bottom: 20px;
          left: 20px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: var(--surface-dark);
          color: var(--primary-dark);
          border: 1px solid var(--border-dark);
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 1.5rem;
          box-shadow: var(--shadow);
          transition: transform 0.2s;
        }
        .theme-toggle:hover {
            transform: scale(1.1);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header class="header">
          <img src="${guild.iconURL()}" alt="Guild Icon" class="guild-icon">
          <div class="header-info">
            <h1>${guild.name}</h1>
            <p>إجمالي الأعضاء: ${filteredMembers.size}</p>
          </div>
        </header>

        <div class="controls">
          <input type="text" id="search-input" class="search-input" placeholder="ابحث بالاسم أو ID...">
        </div>
        
        <div id="loading-state">
            <p>جاري تحميل قائمة الأعضاء...</p>
        </div>

        <div class="user-list" id="user-list">
          ${
            filteredMembers.size > 0
              ? filteredMembers
                  .map((member) => {
                    const isSent = sentTo.includes(member.id);
                    const statusClass = isSent ? 'sent' : 'not-sent';
                    const statusText = isSent ? 'تم الإرسال' : 'لم يتم الإرسال';
                    return `
                      <div class="user-item ${statusClass}" data-name="${member.user.username.toLowerCase()}" data-id="${member.id}" style="animation-delay: ${Math.random() * 0.5}s;">
                        <img src="${member.user.displayAvatarURL()}" alt="Avatar" class="user-avatar">
                        <div class="user-info">
                          <div class="username">${member.user.username}</div>
                          <div class="userid">ID: ${member.id}</div>
                        </div>
                        <div class="status ${statusClass}">${statusText}</div>
                      </div>
                    `;
                  })
                  .join('')
              : ''
          }
        </div>
        <div id="empty-state">
            <p>لا يوجد أعضاء لعرضهم أو لم يتم العثور على نتائج للبحث.</p>
        </div>
      </div>

      <button id="theme-toggle" class="theme-toggle" title="تبديل الوضع">🌙</button>

      <script>
        document.addEventListener('DOMContentLoaded', () => {
            const themeToggle = document.getElementById('theme-toggle');
            const body = document.body;
            const searchInput = document.getElementById('search-input');
            const userList = document.getElementById('user-list');
            const userItems = userList.querySelectorAll('.user-item');
            const emptyState = document.getElementById('empty-state');
            const loadingState = document.getElementById('loading-state');

            // --- Theme Switcher ---
            const currentTheme = localStorage.getItem('theme');
            if (currentTheme === 'light') {
                body.classList.add('light-mode');
                themeToggle.textContent = '☀️';
            }

            themeToggle.addEventListener('click', () => {
                body.classList.toggle('light-mode');
                let theme = 'dark';
                if (body.classList.contains('light-mode')) {
                    theme = 'light';
                    themeToggle.textContent = '☀️';
                } else {
                    themeToggle.textContent = '🌙';
                }
                localStorage.setItem('theme', theme);
            });

            // --- Search Functionality ---
            function filterUsers() {
                const searchTerm = searchInput.value.toLowerCase();
                let visibleCount = 0;
                userItems.forEach(item => {
                    const name = item.dataset.name;
                    const id = item.dataset.id;
                    const isVisible = name.includes(searchTerm) || id.includes(searchTerm);
                    item.style.display = isVisible ? 'flex' : 'none';
                    if (isVisible) {
                        visibleCount++;
                    }
                });
                emptyState.style.display = (visibleCount === 0) ? 'block' : 'none';
            }
            searchInput.addEventListener('keyup', filterUsers);

            // --- Initial State Handling ---
            // Hide loader and show content
            loadingState.style.display = 'none';
            if (userItems.length === 0) {
                emptyState.style.display = 'block';
                userList.style.display = 'none';
            } else {
                userList.style.display = 'grid';
            }
        });
      </script>
    </body>
    </html>
  `);
});
