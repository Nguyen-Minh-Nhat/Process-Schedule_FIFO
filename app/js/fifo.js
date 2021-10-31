const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const contentTable = $('.content-table');

const inputNumOfProcess = $('.num-process-table  input');

const contentTableBody = contentTable.querySelector('tbody');

const calculateBtn = $('.calculate-btn');

const resetBtn = $('.reset-btn');

const timeMarker = $('.time-marker');

const timeLine = $('.time-line');

const timeToolTips = $('.time-tooltips');

function Process(name, arrivalTime, processTime, waitTime, color) {
	this.name = name;
	this.arrivalTime = arrivalTime;
	this.processTime = processTime;
	this.waitTime = waitTime;
	this.color = color;
}

const colorList = [
	'#E91C2B',
	'#44A0E3',
	'#693599',
	'#EACF2A',
	'#6D330D',
	'#34558B',
	'#F0C05A',
	'#C74375',
	'#F7CAC9',
	'#5F4B8B',
	'#D90B91',
	'#FF6F61',
];

const app = {
	processList: [],
	stacks: [],
	createContentTable(numOfProcess) {
		let html = '';

		for (var i = 0; i < numOfProcess; i++) {
			html += `<tr data-id="${i}" >
							<td class="progress-id"> P${i + 1}</td>
							<td><input class="arrival-time" type="number" min="1" value="${i}" /></td>
							<td><input  class="process-time" type="number" min="1" value="1" /></td>
						</tr>`;
		}
		if (!numOfProcess) {
			html = `<tr data-id="" >
							<td class="progress-id"></td>
							<td><input class="arrival-time" type="number" min="1" value="" /></td>
							<td><input  class="process-time" type="number" min="1" value="" /></td>
						</tr>`;
		}
		contentTableBody.innerHTML = html;
	},

	createTableAWT() {
		const table = document.querySelector('.waiting-time-table');
		let html = `<thead>
							<tr>
								<th>Tiến Trình</th>
								<th>Thời Gian Chờ</th>
							</tr>
						</thead>`;

		app.processList.forEach((process) => {
			html += `<tr>
								<td class="progress-id">${process.name}</td>
								<td>${process.waitTime}</td>
							</tr>`;
		});

		html += `<tr class="AWT">
								<td class="title">Thời Gian Chờ Trung Bình</td>
								<td>${app.calAWT()}</td>
							</tr>`;

		table.innerHTML = html;
	},

	createProcess(name, arrivalTime, processTime) {
		return new Process(name, arrivalTime, processTime);
	},

	createProcessList() {
		let trELs = contentTableBody.querySelectorAll('tr');
		trELs.forEach((el, index) => {
			let arrivalTimeEl = el.querySelector('.arrival-time');
			let processTimeEl = el.querySelector('.process-time');
			let nameProcess = `P${index + 1}`;
			let arrivalTime = parseFloat(arrivalTimeEl.value);
			let processTime = parseFloat(processTimeEl.value);
			let color;
			if (index < colorList.length) color = colorList[index];
			else color = colorList[index + 1 - colorList.length - 1];
			app.processList.push(
				new Process(nameProcess, arrivalTime, processTime, '', color)
			);
		});
	},

	createProcessInCpu(totalTimeAllProcess) {
		let onePercent = totalTimeAllProcess / 100;
		let prePosition = 0;
		const cpu = $('.cpu');
		let html = '';
		app.processList.forEach((process, index) => {
			if (prePosition < process.arrivalTime) {
				position = process.arrivalTime;
				prePosition = process.arrivalTime;
			} else {
				position = prePosition;
			}

			prePosition += process.processTime;
			html += `<div
								class="process"
								style="width: ${process.processTime / onePercent}%; 
			}; left: ${position / onePercent}%"
								>
                <div
										class="process-content"
										style="background-color: ${process.color}; animation-duration:${
				process.processTime
			}s; animation-delay: ${position}s"
									>${process.name}</div>
                  </div>`;
		});

		cpu.innerHTML = html;
	},

	createProcessInStack() {
		const stacks = $('.stacks');
		let html = '';
		app.stacks.forEach((process) => {
			html += `	<div class="process" style="background-color: ${process.color}">
      ${process.name}</div>`;
		});

		stacks.innerHTML = html;
	},

	totalTimeAllProcess() {
		let totalTime = 0;
		app.processList.forEach((process) => {
			process.waitTime =
				totalTime - process.arrivalTime > 0
					? totalTime - process.arrivalTime
					: 0;
			if (totalTime == 0) {
				totalTime += process.arrivalTime + process.processTime;
			} else if (process.arrivalTime > totalTime && totalTime != 0) {
				totalTime = process.arrivalTime + process.processTime;
			} else {
				totalTime += process.processTime;
			}
		});

		return totalTime;
	},

	calAWT() {
		let AWT = 0;
		app.processList.forEach((process) => {
			AWT += process.waitTime;
		});
		console.log(app.processList);
		AWT /= app.processList.length;
		return AWT;
	},

	activeTimeLine(totalTimeAllProcess) {
		let html = '';

		for (let i = 0; i < totalTimeAllProcess + 1; i++) {
			html += `<li class="time-tooltip">
									<div class="line"></div>
									<div class="number">${i}</div>
								</li>`;
		}

		timeToolTips.innerHTML = html;

		timeMarker.classList.add('animation');
		timeMarker.style.animationDuration = `${totalTimeAllProcess}s`;
	},

	FIFO() {
		app.processList.forEach((process) => {
			setTimeout(() => {
				app.stacks.push(process);
				app.createProcessInStack();
				setTimeout(() => {
					let processShifted = app.stacks.shift();
					timeWait = processShifted.processTime;
					app.createProcessInStack();
				}, process.waitTime * 1000);
			}, process.arrivalTime * 1000);
		});
	},

	compare(a, b) {
		let arrivalTimeA = a.arrivalTime;
		let arrivalTimeB = b.arrivalTime;

		let comparison = 0;
		if (arrivalTimeA > arrivalTimeB) {
			comparison = 1;
		} else if (arrivalTimeA < arrivalTimeB) {
			comparison = -1;
		}
		return comparison;
	},

	handleEvent(numOfProcess) {
		calculateBtn.onclick = () => {
			if (numOfProcess) {
				app.processList = [];
				app.createProcessList(numOfProcess);
				app.processList.sort(app.compare);
				let totalTimeAllProcess = app.totalTimeAllProcess();
				app.activeTimeLine(totalTimeAllProcess);
				app.createProcessInCpu(totalTimeAllProcess);
				setTimeout(() => {
					app.createTableAWT();
				}, totalTimeAllProcess * 1000);
				app.FIFO();
			} else alert('Vui Lòng Nhập Số Lượng Tiến Trình');
		};

		resetBtn.onclick = () => {
			inputNumOfProcess.value = 0;
			app.processList = [];
			app.createContentTable(0);
		};

		inputNumOfProcess.onkeypress = (e) => {
			if (e.keyCode === 13) {
				numOfProcess = inputNumOfProcess.value;
				app.createContentTable(numOfProcess);
			}
		};
	},
	start() {
		let numOfProcess = 0;
		app.handleEvent(numOfProcess);
	},
};

app.start();
