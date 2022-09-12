module.exports = (ticket, movie) => {

    let ticketsHTML = ``

    for(let i = 0; i < ticket.seats.length; i++) {
        ticketsHTML += `
        <div class="body">
        <div class="ticket">
            <div class="left">
                <img src="http://localhost:3001/${movie.image_urls[0]}" alt="image" width="250" height="350">
        
                <div class="image">
                    <p class="admit-one">
                        <span>ADMIT ONE</span>
                        <span>ADMIT ONE</span>
                        <span>ADMIT ONE</span>
                    </p>
                    <div class="ticket-number">
                        <p>
                            #${ticket._id}
                        </p>
                    </div>
                </div>
                <div class="ticket-info">
                    <p class="date">
                        <span>TUESDAY</span>
                        <span class="june-29">JUNE 29TH</span>
                        <span>2022</span>
                    </p>
                    <div class="show-name">
                        <h1>${movie.title}</h1>
                        <h2>Name: ${ticket.Name}</h2>
                    </div>
                    <div class="time">
                        <p>8:00 PM <span>TO</span> 11:00 PM</p>
                        <p>SEAT (Row-Col) <span>=></span> ${ticket.seats[i]}</p>
                    </div>
                    <p class="location"><span>iMovies</span>
                        <span class="separator"><i class="far fa-smile"></i></span><span>Shahrah-e-Faisal, Karachi</span>
                    </p>
                </div>
            </div>
            <div class="right">
                <p class="admit-one">
                    <span>ADMIT ONE</span>
                    <span>ADMIT ONE</span>
                    <span>ADMIT ONE</span>
                </p>
                <div class="right-info-container">
                    <div class="show-name">
                        <h1>${movie.title}</h1>
                    </div>
                    <div class="time">
                        <p>8:00 PM <span>TO</span> 11:00 PM</p>
                        <p>SEAT (Row-Col) <span>=></span> ${ticket.seats[i]}</p>
                    </div>
                    <div class="barcode">
                        <img src="https://external-preview.redd.it/cg8k976AV52mDvDb5jDVJABPrSZ3tpi1aXhPjgcDTbw.png?auto=webp&s=1c205ba303c1fa0370b813ea83b9e1bddb7215eb" alt="QR code">
                    </div>
                    <p class="ticket-number">
                        #${ticket._id}
                    </p>
                </div>
            </div>
        </div>
        </div>
        `
    }


    return `
    <style>
    @import url("https://fonts.googleapis.com/css2?family=Staatliches&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap");

@media print {
   .body {
    page-break-before: always;
   }
}
@page {
    margin: 0;
    padding: 0;
    size: 8.5in 11in;
    font-family: 'Staatliches', cursive;
    font-size: 12pt;
    font-weight: 400;
    line-height: 1.5;
    color: #000;
    background: #fff;
    text-align: left;
    text-decoration: none;
    text-shadow: none;
    text-transform: none;
    letter-spacing: normal;
    word-spacing: normal;
    white-space: normal;
    word-wrap: normal;
    word-break: normal;
    -moz-hyphens: none;
    -ms-hyphens: none;
    -webkit-hyphens: none;
    hyphens: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    -o-text-size-adjust: 100%;
    text-size-adjust: 100%;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    -webkit-tap-highlight-color: transparent;
    -webkit-font-feature-settings: normal;
    -moz-font-feature-settings: normal;
    -ms-font-feature-settings: normal;
    -o-font-feature-settings: normal;
    font-feature-settings: normal;
    -webkit-font-kerning: auto;
    -moz-font-kerning: auto;
    -ms-font-kerning: auto;
    -o-font-kerning: auto;
    font-kerning: auto;
    -webkit-font-language-override: normal;
    -moz-font-language-override: normal;
    -ms-font-language-override: normal;
    -o-font-language-override: normal;
    font-language-override: normal;
    -webkit-font-variant-ligatures: normal;
    -moz-font-variant-ligatures: normal;
    -ms-font-variant-ligatures: normal;
    -o-font-variant-ligatures: normal;
    font-variant-ligatures: normal;
    -webkit-font-variant-caps: normal;
    -moz-font-variant-caps: normal;
    -ms-font-variant-caps: normal;
}

* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

body,
html {
	height: 100vh;
	display: grid;
	font-family: "Staatliches", cursive;
	background: #d83565;
	color: black;
	font-size: 14px;
	letter-spacing: 0.1em;
}

.body {
    height: 100vh;
    width: 100%;
    padding: 300px 0px;
}

.ticket {
	margin: auto;
	display: flex;
	background: white;
	box-shadow: rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px;
}

.left {
	display: flex;
}

.left img {
    position: absolute;
    opacity: 0.85;
}

.image {
    position: relative;
	min-height: 350px;
	min-width: 250px;
	/* background-image: url(http://localhost:3001/MV5BYmMxZWRiMTgtZjM0Ny00NDQxLWIxYWQtZDdlNDNkOTEzYTdlXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg); */
	background-size: 100% 100%;
	opacity: 0.85;
}

.admit-one {
	position: absolute;
	color: darkgray;
	height: 350px;
	padding: 0 10px;
	letter-spacing: 0.15em;
	display: flex;
	text-align: center;
	justify-content: space-around;
	writing-mode: vertical-rl;
	transform: rotate(-180deg);
    left: -20;
    z-index: 1000;
}

.admit-one span:nth-child(2) {
	color: white;
	font-weight: 700;
}

.left .ticket-number {
    position: absolute;
    left: -100px;
    color: white;
    font-weight: 700;
	height: 350px;
	width: 350px;
	display: flex;
	justify-content: flex-end;
	align-items: flex-end;
	padding: 5px;
}

.ticket-info {
	padding: 10px 30px;
	display: flex;
	flex-direction: column;
	text-align: center;
	justify-content: space-between;
	align-items: center;
}

.date {
	border-top: 1px solid gray;
	border-bottom: 1px solid gray;
	padding: 5px 0;
	font-weight: 700;
	display: flex;
	align-items: center;
	justify-content: space-around;
}

.date span {
	width: 100px;
}

.date span:first-child {
	text-align: left;
}

.date span:last-child {
	text-align: right;
}

.date .june-29 {
	color: #d83565;
	font-size: 20px;
}

.show-name {
	font-size: 32px;
	color: #d83565;
}

.show-name h1 {
	font-size: 48px;
    font-family: "Nanum Pen Script", cursive;
	font-weight: 700;
	letter-spacing: 0.1em;
	color: #4a437e;
}

.show-name h2 {
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0.1em;
    color: #4a437e;
}

.time {
	padding: 10px 0;
	color: #4a437e;
	text-align: center;
	display: flex;
	flex-direction: column;
	gap: 10px;
	font-weight: 700;
}

.time span {
	font-weight: 400;
	color: gray;
}

.left .time {
	font-size: 16px;
}


.location {
	display: flex;
	justify-content: space-around;
	align-items: center;
	width: 100%;
	padding-top: 8px;
	border-top: 1px solid gray;
}

.location .separator {
	font-size: 20px;
}

.right {
	width: 180px;
    position: relative;
	border-left: 1px dashed #404040;
}

.right .admit-one {
	color: darkgray;
}

.right .admit-one span:nth-child(2) {
	color: gray;
}

.right .right-info-container {
	height: 350px;
	padding: 10px 10px 10px 35px;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;
}

.right .show-name h1 {
	font-size: 18px;
}

.barcode {
	height: 100px;
}

.barcode img {
	height: 100%;
}

.right .ticket-number {
    position: relative;
    top: 20;
	color: gray;
    margin-left: -25px;
}

</style>
<link rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"/>

    ${ticketsHTML}
    `
}