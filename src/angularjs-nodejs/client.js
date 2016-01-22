/**
 * AngularJS directive for Fine Uploader UI jQuery (traditional endpoints).
 * Maintained by Widen Enterprises.
 *
 * This example:
 *  - Delegates error messages to the dialog element.
 *  - Generates client-side pre-upload image previews (where supported).
 *  - Allows files to be excluded based on extension and MIME type (where supported).
 *  - Determines the most appropriate upload button and drop zone text based on browser capabilities.
 *  - Renders larger image preview on-demand in a dialog element.
 *  - Keeps an aggregate progress bar up-to-date based on upload status for all files.
 *  - Enables delete file support.
 *  - Ensure newly submitted files are added to the top of the visible list.
 *  - Enables chunking & auto-resume support.
 *
 * Requirements:
 *  - Fine Uploader 5.4 or 5.5
 *  - Dialog element polyfill 0.4.2
 *  - AngularJS 1.5
 */

(function() {
    function isTouchDevice() {
        return "ontouchstart" in window || navigator.msMaxTouchPoints > 0;
    }

    function initButtonText($scope) {
        var input = document.createElement("input");

        input.setAttribute("multiple", "true");

        if (input.multiple === true && !qq.android()) {
            $scope.uploadButtonText = "Select Files";
        }
        else {
            $scope.uploadButtonText = "Select a File";
        }
    }

    function initDropZoneText($scope, $interpolate) {
        if (qq.supportedFeatures.folderDrop && !isTouchDevice()) {
            $scope.dropZoneText = "Drop Files or Folders Here";
        }
        else if (qq.supportedFeatures.fileDrop && !isTouchDevice()) {
            $scope.dropZoneText = "Drop Files Here";
        }
        else {
            $scope.dropZoneText = $scope.$eval($interpolate("Press '{{uploadButtonText}}'"));
        }
    }

    function bindToRenderedTemplate($compile, $scope, $interpolate, element) {
        $compile(element.contents())($scope);

        initButtonText($scope);
        initDropZoneText($scope, $interpolate);
    }

    function openLargerPreview($scope, uploader, modal, size, fileId) {
        uploader.drawThumbnail(fileId, new Image(), size).then(function(image) {
            $scope.largePreviewUri = image.src;
            $scope.$apply();
            modal.showModal();
        });
    }

    function closePreview(modal) {
        modal.close();
    }

    angular.module("fineUploaderDirective", [])
        .directive("fineUploader", function($compile, $interpolate) {
            return {
                restrict: "A",
                replace: true,

                link: function($scope, element, attrs) {
                    var endpoint = attrs.uploadServer,
                        notAvailablePlaceholderPath = attrs.notAvailablePlaceholder,
                        waitingPlaceholderPath = attrs.waitingPlaceholder,
                        acceptFiles = attrs.allowedMimes,
                        sizeLimit = attrs.maxFileSize,
                        largePreviewSize = parseInt(attrs.largePreviewSize),
                        allowedExtensions = JSON.parse(attrs.allowedExtensions),
                        previewDialog = document.querySelector('.large-preview'),

                        uploader = new qq.FineUploader({
                            debug: true,
                            element: element[0],
                            request: {endpoint: endpoint},

                            validation: {
                                acceptFiles: acceptFiles,
                                allowedExtensions: allowedExtensions,
                                sizeLimit: sizeLimit
                            },

                            deleteFile: {
                                endpoint: endpoint,
                                enabled: true
                            },

                            thumbnails: {
                                placeholders: {
                                    notAvailablePath: notAvailablePlaceholderPath,
                                    waitingPath: waitingPlaceholderPath
                                }
                            },

                            display: {
                                prependFiles: true
                            },

                            failedUploadTextDisplay: {
                                mode: "custom"
                            },

                            retry: {
                                enableAuto: true
                            },

                            chunking: {
                                enabled: true
                            },

                            resume: {
                                enabled: true
                            },

                            callbacks: {
                                onSubmitted: function(id, name) {
                                    var fileEl = this.getItemByFileId(id),
                                        thumbnailEl = fileEl.querySelector('.thumbnail-button');

                                    thumbnailEl.addEventListener('click', function() {
                                        openLargerPreview($scope, uploader, previewDialog, largePreviewSize, id);
                                    });
                                }
                            }
                        });

                    dialogPolyfill.registerDialog(previewDialog);
                    $scope.closePreview = closePreview.bind(this, previewDialog);
                    bindToRenderedTemplate($compile, $scope, $interpolate, element);
                }
            }
        });
})();
