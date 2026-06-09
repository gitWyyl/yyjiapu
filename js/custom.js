const tree = [];
const table = [];
const empty =-999999999; 

let selcell = null;

let rowcount = 0;
let tLim= 0;    // =0
let bLim = 0;   // 普遍<0 特殊 >0

let lLim = 0;   // 普遍>0 特殊 <0
let rLim = 0;   // 普遍<0 特殊 >0


let quit = false;
let isDown = false;//光标有键按下

// 获取设备像素比 (解决字太大/模糊)
const dpr = window.devicePorixelRatio || 1;
const fonth = 16;

let canvas = document.getElementById('iCanvas');
let cwidth=canvas.clientWidth;
let cheight=canvas.clientHeight;

function resizeCanvas() {
    // const rect =canvas.getBoundingClientRect();
    cwidth=canvas.clientWidth;
    cheight=canvas.clientHeight;
    canvas.width = cwidth * dpr;
    canvas.height = cheight * dpr;
    // console.log(`cwidth=${cwidth}  canvas.clientWidth=${canvas.clientWidth} `)
}

let oldx = 0;
let oldy = 0;


//===== 0 点坐标 =========
const safe = fonth;     //安全区边界宽度
let xrate=0.5;          //修正X轴中心坐标,小于0.5偏左,大于0.5偏右

function orix(){ 
    return Math.trunc(1.5*fonth + xrate*(cwidth - 3*fonth))
};

function oriy(){ 
    return safe 
};

//===== 转换坐标 =====
let transx = 0;
let transy = 0;

const csp = 42;                       //(每列间隔)
const rsp = fonth * 5;

function sumrsp(row){                  //(每行间隔)
    return row * rsp;
}

//---数据坐标转为 canvas 坐标
function xtoc(x){return x + orix() + transx };
function ytoc(y){return y + oriy() + transy };

//--- canvas 坐标转为数据坐标
function xtod(x){return x - orix() - transx};
function ytod(y){return y - oriy() - transy};

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
function isObj(obj){
	return typeof obj==='object' && typeof obj.length!=='number';
}

function isArr(arr){
    return Array.isArray(arr) && (arr.length > 0);
}

function hasArr(arr){
    return Array.isArray(arr) && (arr.length >= 0);
}

function hasValue(nums,value){
    return (nums & value) === value
}
