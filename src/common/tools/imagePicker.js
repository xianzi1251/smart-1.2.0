/**
 * 图片选择器，支持摄像头或相册
 */
angular.module('app.services')
    .factory('imagePicker', function(api, $ionicActionSheet) {

        function pickImageFromSystem(deferred, useCamera, size) {
            if (!navigator.camera) {
                return deferred.reject();
            }

            navigator.camera.getPicture(function(data) {
                var image = 'data:image/jpeg;base64,'+ data;
                deferred.resolve({
                    data: image,
                    status: 200
                });
            }, function(data) {
                deferred.reject();
            }, {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: size,
                targetHeight: size,
                correctOrientation: true,
                allowEdit: true,
                sourceType: useCamera ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY
            });
        }

        return {
            // 选择图片 返回base64数据
            pickImage: function functionName() {
                var deferred = api.defer();

                var hideSheet = $ionicActionSheet.show({
                    buttons: [{
                        text: '<span class="action-sheet-text">拍摄</span>'
                    }, {
                        text: '<span class="action-sheet-text">从相册上传</span>'
                    }],
                    titleText: '选择图片',
                    cancelText: '取消',
                    buttonClicked: function(index) {
                        pickImageFromSystem(deferred, index === 0, 600);
                        hideSheet();
                    }
                });

                return deferred.promise;
            },
            // 拍摄图片
            pickImageFromCamera: function() {
                var deferred = api.defer();
                pickImageFromSystem(deferred, true, 320);
                return deferred.promise;
            },
            // 从相册选择图片
            pickImageFromPhotoLibrary: function() {
                var deferred = api.defer();
                pickImageFromSystem(deferred, false, 320);
                return deferred.promise;
            },

            // ng-flow 初始化
            initFlow: function(location,apiUrl,singleFile) {

                if(singleFile == undefined ) {
                    singleFile = false;
                }

                var serviceUrl =  apiUrl || '/global/uploadImageFile';

                var options  = { 
                    target: window.APP_CONFIG.service + serviceUrl + '?location='+location, 
                    testChunks: false, 
                    fileParameterName: 'file', 
                    simultaneousUploads: 6, 
                    chunkSize: 1024 * 1024 * 1024,
                    singleFile : singleFile,
                    headers: function() {
                        return {
                            appkey: APP_CONFIG.appkey,
                            os:  APP_CONFIG.os,
                            osVersion: APP_CONFIG.osVersion,
                            appVersion: APP_CONFIG.appVersion,
                            unique:  APP_CONFIG.unique,
                            subsiteId: APP_CONFIG.subsiteId,
                            language: APP_CONFIG.language,
                            channel: APP_CONFIG.channel,
                            userid: APP_USER.id,
                            userSession: APP_USER.userSession
                        }
                    }
                }
                return options;
            }
        };
    });
