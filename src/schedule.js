const getSchedule = async(context) => {
    var url = undefined, status = 0, ttl = undefined;

    // Status:
    // 0 - no link for ttl
    // 1 - have HTML
    // 2 - timetable json ready
    // 3 - error

    const checkURL = () => {
        try{
            url = context?.req?.cookies?.url;
            if(url) status = 1;
        } catch(e) {
            console.log(e);
            status = 3;
        }
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

    const parsePage = async(html) => {
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
                .filter(line => line.match(/\S/g));


            status = 2;
            return tds;   
        } catch(e) {
            console.log(e);
            status = 3;
        }
    }

    const process = async() => {
        var html;

        await checkURL();
        if (status === 1) html = await getPage();
        if (status === 1) return ttl = await parsePage(html);
    }

    await process();
    return {
        props: {
            timetable: ttl ? ttl : '',
            status: status,
        }
    }
}

export default getSchedule;