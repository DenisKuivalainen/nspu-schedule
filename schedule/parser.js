const fetch = require('node-fetch');
const { getTTFB } = require('web-vitals');

module.exports.getCode = (status) => {
    switch (status) {
        case 2:
            return 200;
        case 3:
            return 500;
        default:
            return 400;
    }
}

module.exports.getSchedule = async(url) => {
    // url - link to timetable
    url = decodeURIComponent(url);
    
    var status = 0, timetable = null;



    // Status:
    // 0 - no link for timetable
    // 1 - have HTML
    // 2 - timetable json ready
    // 3 - error

    const checkURL = () => {
        var re = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/);
        if(!!url && re.test(url)) status = 1;
    }

    const getPage = async() => {
        try{
            const resp = await fetch(url);
            return await resp.text();
        } catch(e) {
            console.log(e);
            status = 3;
        }
    }

    const getCells = async(html) => {
        try{
            const trs = html
                .split("<table")
                .filter(line => line.match(/rasp_table/gm))
                .map(
                    line => {
                        let start = line.indexOf(">");
                        let end = line.indexOf("</table>");
                        return line.substr(start, end - start);
                    }
                )
                .filter(line => line.match(/ислитель/gm))[0]
                .split("<tr>")
                .map(
                    line => {
                        let end = line.lastIndexOf(">");
                        return line.substr(0, end + 1);
                    }
                )
                .map(
                    line => {
                        let end = line.indexOf("</tr>");
                        return line.substr(0, end);
                    }
                )
                .filter(line => line.match(/\S/g));

            let tds = [];

            trs  
                .map(
                    line => {
                        line
                            .split("<td")
                            .map(
                                cell => {
                                    let end = cell.indexOf("</td>");
                                    tds.push(cell.substr(0, end));
                                }
                            )
                    }
                );

            tds = tds
                .map(
                    line => line
                        .replace("&nbsp", "")
                        .replace(/\sid='color\d'/, "")
                        .replace(/\sid='color'/, "")
                )
                .filter(line => line.match(/\S/g))


            status = 2;
            return tds;   
        } catch(e) {
            console.log(e);
            status = 3;
        }
    }

    const parseDayTtl = (arr) => {
        const sliceStr = (str) => str.slice(str.indexOf('>') + 1)
        let obj = {};
        let time = '';
        let ttl = [];

        arr.map(val => {
            let test = /align/gm.test(val) && (val.slice(0, 1) !== '>' || val.slice(1, 2) !== '>');
            if (!test) {
                if (ttl.length > 0) obj = {...obj, [time]: stringsToHtml(ttl)};
                ttl = [];
                time = sliceStr(val);
            } else {
                ttl.push(sliceStr(val));
            }
        });
        return {...obj, [time]: stringsToHtml(ttl)};
    }

    const getTtl = (list) => {
        const regExFind = regex => str => regex.test(str.toLowerCase());
        const findInList = regex => list.findIndex(regExFind(regex));

        var object = {};

        const числитель = findInList(/числитель/gm);
        const знаменатель = findInList(/знаменатель/gm);
        const mo = findInList(/понедельник/gm);
        const ti = findInList(/вторник/gm);
        const ke = findInList(/среда/gm);
        const to = findInList(/четверг/gm);
        const pe = findInList(/пятница/gm);
        const la = findInList(/суббота/gm);

        object.week = {
            type: regExFind(/текущая неделя/gm)(list[числитель]) > 0 ? 0 : 1,
            chisl: list[числитель].substr(list[числитель].indexOf('>') + 1),
            znam: list[знаменатель].substr(list[знаменатель].indexOf('>') + 1),
        }
        object.days = {
            mo: parseDayTtl(list.slice(mo + 1, ti)),
            ti: parseDayTtl(list.slice(ti + 1, ke)),
            ke: parseDayTtl(list.slice(ke + 1, to)),
            to: parseDayTtl(list.slice(to + 1, pe)),
            pe: parseDayTtl(list.slice(pe + 1, la)),
            la: parseDayTtl(list.slice(la + 1)),
        }

        return object;
    }

    const stringsToHtml = (arr) => arr.map((val, k) => {
        
        // let pos = val.indexOf('>');
        // val = val.slice(pos + 1);
        // pos = val.indexOf('<');
        if (val.length === 0) return undefined;

        return /<br>/.test(val) ? `<div className="ttl_head">${val.slice(0, val.indexOf('<') - 1)}</div><div className="ttl_desc">${val.slice(val.indexOf('>') + 1)}</div>` : `<div className="ttl_head">${val}</div>`;
    });

    const process = async() => {
        var html;

        checkURL();
        if (status === 1) html = await getPage();
        if (status === 1) timetable = await getCells(html).then(getTtl);
        return { timetable, status };
    }

    return await process();
}