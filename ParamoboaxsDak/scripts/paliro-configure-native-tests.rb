require 'xcodeproj'

path = File.expand_path('../ios/App/App.xcodeproj', __dir__)
project = Xcodeproj::Project.open(path)
app = project.targets.find { |target| target.name == 'App' }
tests = project.targets.find { |target| target.name == 'PaliroNativeTests' }
unless tests
  tests = project.new_target(:unit_test_bundle, 'PaliroNativeTests', :ios, '15.6')
  tests.add_dependency(app)
  group = project.main_group.new_group('PaliroNativeTests', 'PaliroNativeTests')
  tests.add_file_references([group.new_file('PaliroNativeBridgeTests.swift')])
end
tests.build_configurations.each do |configuration|
  configuration.build_settings.merge!({
    'SWIFT_VERSION' => '5.0',
    'GENERATE_INFOPLIST_FILE' => 'YES',
    'PRODUCT_BUNDLE_IDENTIFIER' => 'site.paliro.native-tests',
    'PRODUCT_NAME' => '$(TARGET_NAME)',
    'TEST_HOST' => '$(BUILT_PRODUCTS_DIR)/App.app/App',
    'BUNDLE_LOADER' => '$(TEST_HOST)',
    'TARGETED_DEVICE_FAMILY' => '1,2',
    'CODE_SIGN_STYLE' => 'Automatic'
  })
end
project.save
scheme_path = File.join(path, 'xcshareddata/xcschemes/PaliroNativeTests.xcscheme')
scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(app)
scheme.add_test_target(tests)
scheme.set_launch_target(app)
scheme.save_as(path, 'PaliroNativeTests', true)
