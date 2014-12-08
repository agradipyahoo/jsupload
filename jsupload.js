(function (window) {


    var getUniqueContentId = (function () {
        var counter = 0;
        return function () {
            return 'js-upload-' + (counter++);
        }
    })();

    function format() {
        var args = [].slice.call(arguments);
        var initial = args.shift();

        function replacer(text, replacement) {
            return text.replace('%s', replacement);
        }

        return args.reduce(replacer, initial);
    }

    /**
     * Allowing Ajax FIle Upload using native html5 /XHR2
     * @param settings
     * @constructor
     */
    var JSUpload = function (settings) {
        var el = $('#' + settings.button_placeholder_id) , multipleUpload = "", acceptFileType = "";
        var fileTemplate = '<input type="file" %s class="add-files-input" accept="%s" style="display: none;">';
        if (settings.file_queue_limit > 1) {
            multipleUpload = 'multiple="multiple"';
        }
        acceptFileType = settings.file_types;
        fileTemplate = format(fileTemplate, multipleUpload, acceptFileType);
        var inputEl = $(fileTemplate);
        var fileIdList = [] , _this = this;
        var fileIndex = {} , requestMap = {} , errorCode, errorFileIndex = {};
        inputEl.on('change', function (event) {
            event.stopPropagation();
            var inputHTMLEl = inputEl[0];
            var files = inputHTMLEl.files;
            _this.errorFileIndex = {}; //reseting
            for (var i = 0, len = files.length; i < len; i++) {
                var file = files[i];
                var id = getUniqueContentId();
                file.id = id;
                fileIndex[id] = file;
                fileIdList.push(id);
                settings.file_queued_handler.call(null, file);
                errorCode = _this.validate(file);
                if (errorCode === 0) {
                    if (_.isFunction(settings.file_dialog_complete_handler)) {
                        settings.file_dialog_complete_handler.apply(_this, [files.length, fileIdList.length]);
                    }
                }
                else {
                    _this.errorFileIndex[id] = file;
                    _this.fileQueueError(file, errorCode);
                }
            }
        });

        el.on('click', function (e) {
            e.preventDefault();
            if (_.isFunction(settings.file_dialog_start_handler)) {
                settings.file_dialog_start_handler.call(null);
            }
            inputEl.click();
        });

        this.fileIdList = fileIdList;
        this.fileIndex = fileIndex;
        this.requestMap = requestMap;
        this.errorFileIndex = errorFileIndex;
        this.settings = settings;

    };


    JSUpload.QUEUE_ERROR = {
        FILE_EXCEEDS_SIZE_LIMIT: -110,
        ZERO_BYTE_FILE: -120,
        INVALID_FILETYPE: -130
    };

    JSUpload.FILE_TYPE_RULE = {
        '*.csv': '^text\/(csv)$',
        'image/*': '^image\/(gif|jpeg|png|jpg)$',
        'video/*': '^video\/[a-zA-Z0-9\-]+$',
        'audio/*': '^audio/[a-zA-Z0-9\-]+$'
    };

    JSUpload.prototype = {
        /**
         * setPostParams
         * @param settings
         */
        setPostParams: function (settings) {
            this.settings.post_params = _.extend(this.settings.post_params, settings);
        },
        /**
         *
         * @param file
         * @returns {Number}
         */
        validate: function (file) {
            console.log(file);
            var typeError = this.validateFileType(file) , errorCode = 0;
            if (typeError.error) {
                return typeError.errorCode;
            }
            var sizeError = this.validateFileSize(file);
            if (sizeError.error) {
                return sizeError.errorCode;
            }
            return errorCode;
        },
        /**
         *Validating File Types
         * @param file
         * @returns {error: boolean, errorCode: String}
         */
        validateFileType: function (file) {
            //#todo file type validation text/csv,
            var pattern , file_types = this.settings.file_types ,
                fileType = JSUpload.FILE_TYPE_RULE[file_types] ,
                returnValue = {error: true, errorCode: JSUpload.QUEUE_ERROR.INVALID_FILETYPE};
            if (fileType) {
                pattern = new RegExp(fileType);
                if (pattern.test(file.type)) {
                    returnValue = {error: false};
                }
            }
            return returnValue;
        },
        /**
         * Validate queue file
         * @param file
         * @returns {error: boolean, errorCode: String}
         */
        validateFileSize: function (file) {
            //validating uploaded file base on settings before uploading
            var settings = this.settings , fileSizeLimit = settings.file_size_limit ,
                unit = '' , sizes = ['BYTES', 'KB', 'MB', 'GB'] , errorCode = 0 , size , error = false;
            if (file.size > 0) {
                if (fileSizeLimit) { //if fileSizeLimit config present
                    fileSizeLimit = fileSizeLimit.split(" ");
                    if (fileSizeLimit.length > 1) { // if file_size_limit for correct
                        unit = String(fileSizeLimit[1]).toUpperCase();
                        if (_.indexOf(sizes, unit)) { // check if the unit is present in predefined set
                            size = Number(fileSizeLimit[0]);
                            switch (unit) {
                                case 'KB':
                                    size = size * Math.pow(1024, 1);
                                    break;
                                case 'MB':
                                    size = size * Math.pow(1024, 2);
                                    break;
                                case 'GB':
                                    size = size * Math.pow(1024, 3);
                                    break;
                            }

                            if (file.size > size) { // if quequed file is greather than file_size limit
                                errorCode = JSUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT;
                                error = true;
                            }
                        }
                    }
                }
            }
            else {
                //throw error
                errorCode = JSUpload.QUEUE_ERROR.ZERO_BYTE_FILE;
                error = true;
            }
            return {error: error, errorCode: errorCode};
        },
        /**
         * Check Any error
         * @param id
         */
        hasAnyError: function (id) {
            return _.has(this.errorFileIndex, id);
        },
        /**
         * Start JS Upload
         */
        startUpload: function () {
            var _this = this;
            var curId = this.fileIdList.shift();
            var curFile = this.fileIndex[curId];
            var settings = this.settings;
            var formData = new FormData() , isSuccess = false, filePostName = this.settings.file_post_name || "fileData";

            if (!this.hasAnyError(curId)) {
                _.each(this.settings.post_params, function (value, key) {
                    formData.append(key, value);
                });
                var xhr = new XMLHttpRequest();
                formData.append('Filename', curFile.name); //sending these param for amazon s3 upload to match signature.
                formData.append(filePostName, curFile);
                xhr.open('POST', settings.upload_url, true);
                settings.upload_start_handler.call(_this, curFile);
                this.requestMap[curId] = xhr;
                xhr.onload = function () {
                    isSuccess = xhr.status >= 200 && xhr.status < 300 || xhr.status === 304;
                    if (isSuccess) {
                        settings.upload_success_handler.call(_this, curFile, xhr.responseText);
                    }
                    else {
                        settings.upload_error_handler.call(_this, curFile, xhr.status);
                    }
                    settings.upload_complete_handler.call(_this, curFile);
                    if (_this.getStats().files_queued === 0) {
                        settings.queue_complete_handler.call(_this);
                    }
                    delete _this.requestMap[curId];
                    delete _this.fileIndex[curId];
                };
                xhr.upload.onprogress = function (event) {
                    settings.upload_progress_handler.apply(_this, [curFile, event.loaded, event.total]);
                };
                xhr.error = function () {
                    settings.upload_error_handler.apply(this, arguments);
                    ettings.upload_complete_handler.call(_this, curFile);
                };
                xhr.send(formData);  // multipart/form-data
            }
            else {
                delete _this.errorFileIndex[curId];
                delete _this.fileIndex[curId];
            }
        },
        fileQueueError: function (file, errorCode) {
            this.settings.file_queue_error_handler.apply(this, [file, errorCode]);
        },
        getStats: function () {
            return {
                files_queued: this.fileIdList.length
            }
        },
        /**
         * Cancel Upload
         * @param id
         */
        cancelUpload: function (id) {
            //just placeholder not needed
            if (_.has(this.requestMap, id)) {
                this.requestMap[id].abort();
            }
        },
        destroy: function () {
            //placeholder required
        },
        debug: function () {
            //placeholder required
        }
    };

    window.JSUpload = JSUpload;


})(window);