import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import static com.kms.katalon.core.testobject.ObjectRepository.findWindowsObject
import com.kms.katalon.core.checkpoint.Checkpoint as Checkpoint
import com.kms.katalon.core.cucumber.keyword.CucumberBuiltinKeywords as CucumberKW
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.model.FailureHandling as FailureHandling
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testng.keyword.TestNGBuiltinKeywords as TestNGKW
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.windows.keyword.WindowsBuiltinKeywords as Windows
import internal.GlobalVariable as GlobalVariable
import org.openqa.selenium.Keys as Keys

// Open browser and navigate to the OrangeHRM login page
WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login')

// Wait for page to load
WebUI.waitForElementPresent(findTestObject('Object Repository/Page_Login/input_Username'), 30)

// Login with default admin credentials
WebUI.setText(findTestObject('Object Repository/Page_Login/input_Username'), 'Admin')
WebUI.setText(findTestObject('Object Repository/Page_Login/input_Password'), 'admin123')
WebUI.click(findTestObject('Object Repository/Page_Login/button_Login'))

// Navigate to PIM module
WebUI.waitForElementPresent(findTestObject('Object Repository/Page_Dashboard/a_PIM'), 30)
WebUI.click(findTestObject('Object Repository/Page_Dashboard/a_PIM'))

// Click Add Employee button
WebUI.waitForElementPresent(findTestObject('Object Repository/Page_PIM/button_Add'), 30)
WebUI.click(findTestObject('Object Repository/Page_PIM/button_Add'))

// Add employee details
WebUI.waitForElementPresent(findTestObject('Object Repository/Page_PIM_AddEmployee/input_FirstName'), 30)
WebUI.setText(findTestObject('Object Repository/Page_PIM_AddEmployee/input_FirstName'), firstName)
WebUI.setText(findTestObject('Object Repository/Page_PIM_AddEmployee/input_LastName'), lastName)

// Capture employee ID for later verification
String employeeId = WebUI.getAttribute(findTestObject('Object Repository/Page_PIM_AddEmployee/input_EmployeeId'), 'value')

// Create login credentials for the employee
WebUI.click(findTestObject('Object Repository/Page_PIM_AddEmployee/span_Create_Login_Details'))
WebUI.setText(findTestObject('Object Repository/Page_PIM_AddEmployee/input_Username'), firstName.toLowerCase() + '.' + lastName.toLowerCase())
WebUI.setText(findTestObject('Object Repository/Page_PIM_AddEmployee/input_Password'), 'Password123')
WebUI.setText(findTestObject('Object Repository/Page_PIM_AddEmployee/input_ConfirmPassword'), 'Password123')

// Save the employee record
WebUI.click(findTestObject('Object Repository/Page_PIM_AddEmployee/button_Save'))

// Verify successful save by checking if we're on the employee details page
WebUI.waitForElementPresent(findTestObject('Object Repository/Page_PIM_EmployeeDetails/h6_Personal_Details'), 30)
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_PIM_EmployeeDetails/h6_Personal_Details'), 10)

// Verify the employee name is displayed correctly
WebUI.verifyElementText(findTestObject('Object Repository/Page_PIM_EmployeeDetails/div_EmployeeFullName'), firstName + ' ' + lastName)

// Take screenshot of the employee details page
WebUI.takeScreenshot('Screenshots/employee_added_details.png')

// Navigate back to employee list
WebUI.click(findTestObject('Object Repository/Page_PIM/a_Employee_List'))

// Search for the newly added employee
WebUI.waitForElementPresent(findTestObject('Object Repository/Page_PIM_EmployeeList/input_EmployeeId'), 30)
WebUI.setText(findTestObject('Object Repository/Page_PIM_EmployeeList/input_EmployeeId'), employeeId)
WebUI.click(findTestObject('Object Repository/Page_PIM_EmployeeList/button_Search'))

// Verify employee appears in search results
WebUI.waitForElementPresent(findTestObject('Object Repository/Page_PIM_EmployeeList/div_Search_Results'), 30)
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_PIM_EmployeeList/div_Search_Results_FirstRow'), 10)

// Log out
WebUI.click(findTestObject('Object Repository/Page_Dashboard/span_User_Dropdown'))
WebUI.click(findTestObject('Object Repository/Page_Dashboard/a_Logout'))

// Close browser
WebUI.closeBrowser()