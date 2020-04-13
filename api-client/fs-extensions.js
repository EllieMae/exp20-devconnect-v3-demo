var path = require('path');

exports.addExtensions = function (fs) {
    
    fs.saveToFile = function(filePath, data) {
        var dirName = path.dirname(filePath);
        fs.mkdirSync(dirName, { recursive: true });
        fs.writeFileSync(filePath, 
            JSON.stringify(JSON.parse(data), null, 2));
    };

    return fs;
};