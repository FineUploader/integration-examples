(function($) {
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
                        allowedExtensions = $.map(attrs.allowedExtensions.split(","), function(extension) {
                            return $.trim(extension);
                        });

                    $(element).fineUploader({
                        request: {
                            endpoint: endpoint,
                            params: {
                                sendThumbnailUrl: !qq.supportedFeatures.imagePreviews
                            }
                        },

                        validation: {
                            acceptFiles: acceptFiles,
                            allowedExtensions: allowedExtensions,
                            sizeLimit: sizeLimit
                        },

                        deleteFile: {
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
                        }
                    });

                    bindToRenderedTemplate($compile, $scope, $interpolate, element);
                }
            }
        });
})(jQuery);
