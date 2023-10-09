Feature: Earthquake Data, Filter validations

  Scenario: Synchronize and validate earthquake data
    Given I fetch the latest earthquakes from USGS
    And I am logged into the app
    When I synchronize the app's earthquake data
    Given I wait for 2 seconds
    Then the earthquake data should be validated against the original
    When I send an API call with modified startTime
    Then I should see the latest earthquake details in response
    When I send an API call with parameters startTime and endTime
    Then I should see the latest earthquake details in response
    When I send an API call with different magType
    Then I should not see the latest earthquake details in response
    When I send an API call out of the range
    Then I should not see the latest earthquake details in response
