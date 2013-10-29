(function($) {
    function bindToRenderedTemplate($compile, $scope, element) {
        $compile(element.contents())($scope);

        if (qq.supportedFeatures.folderDrop) {
            $scope.dropZoneText = "Drop Files or Folders Here";
        }
        else if (qq.supportedFeatures.fileDrop) {
            $scope.dropZoneText = "Drop Files Here";
        }
        else {
            $scope.dropZoneText = "Select a File";
        }
    }

    angular.module("fineUploaderDirective", [])
        .directive("fineUploader", function($compile) {
            return {
                restrict: "A",
                replace: true,

                link: function($scope, element, attrs) {
                    var endpoint = attrs.uploadServer,
                        notAvailablePlaceholderPath = attrs.notAvailablePlaceholder,
                        waitingPlaceholderPath = attrs.waitingPlaceholder;

                    $(element).fineUploader({
                        endpoint: endpoint,
                        thumbnails: {
                            placeholders: {
                                waitUntilResponse: true,
                                notAvailablePath: notAvailablePlaceholderPath,
                                waitingPath: waitingPlaceholderPath
                            }
                        }
                    });

                    bindToRenderedTemplate($compile, $scope, element);
                }
            }
        });
})(jQuery);
