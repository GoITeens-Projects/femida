<div style="border-bottom: 1px solid #eee">
    <h1 style="text-align: center; border-bottom: none"><b>BotName</b></h1>
    <center>
        <a href="https://github.com/EgorMaz230/discord_bot_goIteens/graphs/contributors" >
          <img src="https://contrib.rocks/image?repo=EgorMaz230/discord_bot_goIteens"  />
        </a>
        <a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=22&pause=1000&color=EEEEEE&background=0F09FF00&center=true&vCenter=true&multiline=true&repeat=false&random=false&width=910&height=100&lines=BotName+-+%D1%86%D0%B5+%D0%B4%D1%96%D1%81%D0%BA%D0%BE%D1%80%D0%B4+%D0%B1%D0%BE%D1%82+%D1%81%D1%82%D0%B2%D0%BE%D1%80%D0%B5%D0%BD%D0%B8%D0%B9+%D0%BA%D0%BE%D0%BC%D0%B0%D0%BD%D0%B4%D0%BE%D1%8E+%D1%83%D0%BA%D1%80%D0%B0%D1%97%D0%BD%D1%81%D1%8C%D0%BA%D0%B8%D1%85+%D1%80%D0%BE%D0%B7%D1%80%D0%BE%D0%B1%D0%BD%D0%B8%D0%BA%D1%96%D0%B2%E2%8F%AB" alt="Typing SVG" /></a>
    </center>
</div>

<h2 align="center" style="border-bottom: none"><i>Швидко знайти потрібну інформацію ви можете тут:</i></h2>

- [Основна інформація](#general-information)

* [Технології, які використовувались](#technologies-used)
* [Можливості боту](#abilities)

<div>
    <h2 id="general-information">Основна інформація</h2>

<img src="https://cdn.discordapp.com/avatars//67e01b864865bb1cf7cd0d2acb9356b2.png?size=256" align="right" vertical-align="center">

<p style="font-size: 1.15em;">
BotName - це бот який вміє виконувати адміністративні функції і має систему рівнів та XP, які нараховуються за спілкування на сервері. Зокрема мутити за спам та нецензурні слова, нараховувати XP за повідомлення, за участь у голосовому каналі, за буст серверу, за запрошення нового учасника серверу <i>(умова - Ви повинні бути на сервері більш ніж місяць)</i>, та навіть за участь у трибуні, все це в компетенції нашого боту.
        </p>
    <p style="font-size: 1.1em;"> Невеличкий спойлер: планується додати вебінтерфейс до BotName, а це означає що дуже скоро Ви матимете широкі можливості для налаштування боту саме під Ваш діскорд сервер😉</p>

> Бот створений за підтримки академії GoITeens🤝
</div>
<div>
    <h2 id="technologies-used">Технології, які використовувались</h2>

<div style="display: flex; justify-content: center; margin-bottom: 50px; margin-top: 50px">
<img src="https://img.shields.io/badge/node.js-%2344883e?style=for-the-badge&logo=node.js&labelColor=black" style="margin-right: 1.1em" />
        
<img src="https://img.shields.io/badge/discord.js%20v14-%231e2124?style=for-the-badge&logo=discord&labelColor=black" style="margin-right: 1.1em"  />

<img src="https://img.shields.io/badge/mongoDB-%233FA037?style=for-the-badge&logo=mongoDB&labelColor=black" />
</div>

<p style="font-size: 1.1em;">Також у цьому проєкті використовувались додаткові технології у вигляді пакетів. Ознайомитися з ними можна у <a href="https://github.com/EgorMaz230/discord_bot_goIteens/blob/main/package.json">package.json</a></p>

<i>Примітка: MongoDB використовується для бази даних за допомогою якої саме було реалізовано систему рівнів🍃</i>

</div>

<div>
    <h2 id="abilities">Можливості боту</h2>
    <p style="font-size: 1.1em;">Майже всі функції додають XP у властивість <code>currentXp</code>. Кожного дня о 12 годині ночі <code>currentXp</code> обнуляється, а досвід додається у властивість <code>XP</code></p>
    <ul>
       <li>
            <h3 id="xpForMessage">Додавання балів за спілкування у чаті💬</h3>
            <a href="https://github.com/EgorMaz230/discord_bot_goIteens/blob/main/src/interactions/messages.js">messages.js</a> & <a href="https://github.com/EgorMaz230/discord_bot_goIteens/blob/main/src/interactions/whenMessageDelete.js">whenMessageDelete.js</a>
            <p>Додає 0.5 XP якщо повідомлення довше за 3 літери та у ньому немає постійного повторення один і тих самих літер.</p>
            <i>Примітка: якщо повідомлення видалилось, то у користувача відніметься 0.5 XP</i>
       </li> 
       <li>
        <h3 id="antispam">Антиспам💢</h3>
        <a href="https://github.com/EgorMaz230/discord_bot_goIteens/blob/main/src/interactions/useAntispam.js">useAntispam.js</a>
        <p>Мутить користувача якщо той спамить однаковими повідомлення та віднімає 5 XP</p>
       </li>
       <li>
       <h3 id="xpForInvites">Додавання балів за запрошення користувачів на сервер📩</h3>
         <a href="https://github.com/EgorMaz230/discord_bot_goIteens/blob/main/src/interactions/updateInvites.js">updateInvites.js</a>
         <p>Додає 100 XP якщо ви доєднали людину до серверу.</p>
         <p>Голова умова - ви повинні перебувати на сервері більш ніж місяць</p>
       </li> 
       <li>
        <h3 id="xpForVoice">Додавання балів за спілкування у голосовому чаті🗣</h3>
        <a href="https://github.com/EgorMaz230/discord_bot_goIteens/blob/main/src/interactions/voiseStateUpdate.js">voiseStateUpdate.js</a> & <a href="https://github.com/EgorMaz230/discord_bot_goIteens/blob/main/src/interactions/check-role-in-vc.js">check-role-in-vc.js</a>
        <p>Одноразово додає 20 XP якщо у чаті присутні чотири або більше користувачів.</p>
        <i>Примітка 1: якщо серед учасників присутній адміністратор або модератор бот додатково додасть 30 XP (наявність чотирьох користувачів не обов'язкова)</i> <br>
        <i>Примітка 2: нарахування відбувається не тільки у голосових каналах, а також у трибунах</i>
       </li> 
       <li>
         <h3 id="xpForBoost">Додавання балів за буст серверу☂</h3>
        <a href="https://github.com/EgorMaz230/discord_bot_goIteens/blob/main/src/interactions/whenBoost.js">whenBoost.js</a>
        <p>Додає 50 XP користувачу за буст серверу.</p>
       </li> 
       <li>
            <h3 id="monthRating">Формує щомісячний рейтинг найактивніших учасників серверу📜</h3>
            <a href="https://github.com/EgorMaz230/discord_bot_goIteens/blob/main/src/interactions/sendRatingEveryMonth.js">sendRatingEveryMonth.js</a> & <a href="https://github.com/EgorMaz230/discord_bot_goIteens/blob/main/src/utils/creatingRatingEmbed.js">creatingRatingEmbed.js</a>
            <p>Першого числа кожного місяця зранку відправляє топ 15 найактивніших учасників серверу. Якщо ім'я користувача надто довге то воно буде обрізане.</p>
       </li>
       <li>
       <h3 id="xpCommand">Команда: <code>/xp</code></h3>
            <a href="https://github.com/EgorMaz230/discord_bot_goIteens/blob/main/src/commands/slashCommands/xp.js">xp.js</a>
            <p>Дозволяє переглянути рівень та XP певного користувача. Має один параметр де треба вказати користувача дані про якого Ви хочете отримати.</p>
            <i>Примітка: параметр не є обов'язковим, тому якщо залишити його пустим отримаєте Ваш рівень та XP</i>
       </li>
    </ul>

</div>